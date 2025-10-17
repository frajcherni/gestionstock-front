import React, { Fragment, useEffect, useState, useMemo, useCallback } from "react";
import {
    Card, CardBody, Col, Container, CardHeader, Row, Modal, ModalHeader, Nav,
    NavItem, NavLink, Form, ModalBody, ModalFooter, Label, Input, FormFeedback, Badge, Table, Button, InputGroupText, InputGroup, FormGroup
} from "reactstrap";
import { Link } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from "yup";
import { useFormik } from "formik";
import moment from "moment";
import Flatpickr from "react-flatpickr";
import {
    fetchBonsCommande, createBonCommande, updateBonCommande, deleteBonCommande, fetchNextCommandeNumberFromAPI
} from "../../../Components/BonCommande/BonCommandeServices";
import { fetchArticles, fetchFournisseurs } from "../../../Components/Article/ArticleServices";
import { Article, Fournisseur, BonCommande } from "../../../Components/Article/Interfaces";
import classnames from "classnames";
import { createBonReception, fetchNextReceptionNumberFromAPI } from "../../../Components/BonReception/BonReceptionServices";

const BonCommandeList = () => {
    const [detailModal, setDetailModal] = useState(false);
    const [selectedBonCommande, setSelectedBonCommande] = useState<BonCommande | null>(null);
    const [isTaxInclusive, setIsTaxInclusive] = useState(false);
    const [taxMode, setTaxMode] = useState<"HT" | "TTC">("HT");
    const [activeTab, setActiveTab] = useState("1");
    const [modal, setModal] = useState(false);
    const [bonsCommande, setBonsCommande] = useState<BonCommande[]>([]);
    const [filteredBonsCommande, setFilteredBonsCommande] = useState<BonCommande[]>([]);
    const [bonCommande, setBonCommande] = useState<BonCommande | null>(null);
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [searchText, setSearchText] = useState("");
    const [articleSearch, setArticleSearch] = useState("");
    const [fournisseurSearch, setFournisseurSearch] = useState("");
    const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [filteredFournisseurs, setFilteredFournisseurs] = useState<Fournisseur[]>([]);
    const [selectedArticles, setSelectedArticles] = useState<{
        article_id: number;
        quantite: number;
        prixUnitaire: number;
        tva?: number | null;
        remise?: number | null;
        articleDetails?: Article;
    }[]>([]);
    const [showRemise, setShowRemise] = useState(false);
    const [remiseType, setRemiseType] = useState<"percentage" | "fixed">("percentage");
    const [globalRemise, setGlobalRemise] = useState<number>(0);
    const [isCreatingReception, setIsCreatingReception] = useState(false);
    const [nextNumeroCommande, setNextNumeroCommande] = useState("");
    const [nextNumeroReception, setNextNumeroReception] = useState("");

    const tvaOptions = [
        { value: null, label: "Non applicable" },
        { value: 0, label: "0% (Exonéré)" },
        { value: 7, label: "7%" },
        { value: 10, label: "10%" },
        { value: 13, label: "13%" },
        { value: 19, label: "19%" },
        { value: 21, label: "21%" }
    ];

    useEffect(() => {
        if (articleSearch.length >= 3) {
            const filtered = articles.filter(article =>
                article.designation.toLowerCase().includes(articleSearch.toLowerCase()) ||
                article.reference.toLowerCase().includes(articleSearch.toLowerCase())
            );
            setFilteredArticles(filtered);
        } else {
            setFilteredArticles([]);
        }
    }, [articleSearch, articles]);

    useEffect(() => {
        if (fournisseurSearch.length >= 3) {
            const filtered = fournisseurs.filter(fournisseur =>
                fournisseur.raison_sociale.toLowerCase().includes(fournisseurSearch.toLowerCase())
            );
            setFilteredFournisseurs(filtered);
        } else {
            setFilteredFournisseurs([]);
        }
    }, [fournisseurSearch, fournisseurs]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [bonsData, fournisseursData, articlesData] = await Promise.all([
                fetchBonsCommande(),
                fetchFournisseurs(),
                fetchArticles()
            ]);

            setBonsCommande(bonsData);
            setFilteredBonsCommande(bonsData);
            setFournisseurs(fournisseursData);
            setArticles(articlesData);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Échec du chargement des données");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let result = [...bonsCommande];

        if (startDate && endDate) {
            const start = moment(startDate).startOf('day');
            const end = moment(endDate).endOf('day');

            result = result.filter(bon => {
                const bonDate = moment(bon.dateCommande);
                return bonDate.isBetween(start, end, null, '[]');
            });
        }

        if (searchText) {
            const searchLower = searchText.toLowerCase();
            result = result.filter(bon =>
                bon.numeroCommande.toLowerCase().includes(searchLower) ||
                (bon.fournisseur?.raison_sociale && bon.fournisseur.raison_sociale.toLowerCase().includes(searchLower))
            );
        }

        setFilteredBonsCommande(result);
    }, [startDate, endDate, searchText, bonsCommande]);

    const openDetailModal = (bonCommande: BonCommande) => {
        setSelectedBonCommande(bonCommande);
        setDetailModal(true);
    };

    const fetchNextCommandeNumber = useCallback(async () => {
        try {
            const numero = await fetchNextCommandeNumberFromAPI();
            setNextNumeroCommande(numero);
        } catch (err) {
            toast.error("Échec de la récupération du numéro de commande");
            const year = moment().format('YYYY');
            const nextNum = `BC-${String(bonsCommande.length + 1).padStart(4, '0')}/${year}`;
            setNextNumeroCommande(nextNum);
        }
    }, [bonsCommande]);

    const fetchNextReceptionNumber = useCallback(async () => {
        try {
            const numero = await fetchNextReceptionNumberFromAPI();
            setNextNumeroReception(numero);
        } catch (err) {
            toast.error("Échec de la récupération du numéro de réception");
            const year = moment().format('YYYY');
            const nextNum = `REC-${String(bonsCommande.length + 1).padStart(4, '0')}/${year}`;
            setNextNumeroReception(nextNum);
        }
    }, [bonsCommande]);

    useEffect(() => {
        if (modal && !isEdit) {
            if (isCreatingReception) {
                fetchNextReceptionNumber();
            } else {
                fetchNextCommandeNumber();
            }
        }
    }, [modal, isEdit, isCreatingReception, fetchNextCommandeNumber, fetchNextReceptionNumber]);

    const { subTotal, totalTax, totalTTCBeforeRemise, grandTotal } = useMemo(() => {
        if (selectedArticles.length === 0) {
            return {
                subTotal: "0",
                totalTax: "0",
                totalTTCBeforeRemise: "0",
                grandTotal: "0"
            };
        }
    
        let subTotalValue = 0;
        let totalTaxValue = 0;
        let grandTotalValue = 0;
    
        selectedArticles.forEach(article => {
            const qty = Number(article.quantite) || 1;
            const price = Number(article.prixUnitaire) || 0;
            const tvaRate = Number(article.tva ?? 0);
            const remiseRate = Number(article.remise || 0);
    
            const montantHTLigne = qty * price * (1 - (remiseRate / 100));
            const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
            const taxAmount = montantTTCLigne - montantHTLigne;
    
            subTotalValue += montantHTLigne;
            totalTaxValue += taxAmount;
            grandTotalValue += montantTTCLigne;
        });
    
        const totalTTCBefore = grandTotalValue;
    
        if (showRemise && Number(globalRemise) > 0) {
            if (remiseType === "percentage") {
                grandTotalValue = grandTotalValue * (1 - (Number(globalRemise) / 100));
            } else {
                grandTotalValue = Number(globalRemise);
            }
        }
    
        return {
            subTotal: subTotalValue.toFixed(2),
            totalTax: totalTaxValue.toFixed(2),
            totalTTCBeforeRemise: totalTTCBefore.toFixed(2),
            grandTotal: grandTotalValue.toFixed(2)
        };
    }, [selectedArticles, showRemise, globalRemise, remiseType]);

    const handleDelete = async () => {
        if (!bonCommande) return;

        try {
            await deleteBonCommande(bonCommande.id);
            setDeleteModal(false);
            fetchData();
            toast.success("Bon de commande supprimé avec succès");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de la suppression");
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const commandeData = {
                ...values,
                taxMode,
                articles: selectedArticles.map(item => ({
                    article_id: item.article_id,
                    quantite: item.quantite,
                    prix_unitaire: item.prixUnitaire,
                    tva: item.tva,
                    remise: item.remise
                })),
                remise: globalRemise,
                remiseType: remiseType,
                totalHT: subTotal,
                totalTVA: totalTax,
                totalTTC: grandTotal
            };

            if (isCreatingReception) {
                commandeData.bonCommande_id = bonCommande?.id;
                await createBonReception(commandeData);
                toast.success("Bon de réception créé avec succès");
            } else {
                if (isEdit && bonCommande) {
                    await updateBonCommande(bonCommande.id, commandeData);
                    toast.success("Bon de commande mis à jour avec succès");
                } else {
                    await createBonCommande(commandeData);
                    toast.success("Bon de commande créé avec succès");
                }
            }

            setModal(false);
            fetchData();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de l'opération");
        }
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            numeroCommande: isEdit ? (bonCommande?.numeroCommande || "") : isCreatingReception ? "" : nextNumeroCommande,
            numeroReception: isCreatingReception ? nextNumeroReception : "",
            dateReception: moment().format("YYYY-MM-DD"),
            fournisseur_id: bonCommande?.fournisseur?.id ?? "",
            dateCommande: bonCommande?.dateCommande ? moment(bonCommande.dateCommande).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
            status: bonCommande?.status ?? "Brouillon",
            notes: bonCommande?.notes ?? "",
            isCreatingReception: isCreatingReception
        },
        validationSchema: Yup.object().shape({
            dateCommande: Yup.date().when('isCreatingReception', {
                is: false,
                then: (schema) => schema.required("La date de commande est requise")
            }),
            dateReception: Yup.date().when('isCreatingReception', {
                is: true,
                then: (schema) => schema.required("La date de réception est requise")
            }),
            numeroCommande: Yup.string().when('isCreatingReception', {
                is: false,
                then: (schema) => schema.required("Le numéro est requis")
            }),
            numeroReception: Yup.string().when('isCreatingReception', {
                is: true,
                then: (schema) => schema.required("Le numéro de réception est requis")
            }),
            fournisseur_id: Yup.number().required("Le fournisseur est requis"),
            //status: Yup.string().required("Le statut est requis"),
            isCreatingReception: Yup.boolean()
        }),
        onSubmit: handleSubmit
    });

    const toggleModal = useCallback(() => {
        if (modal) {
            setModal(false);
            setBonCommande(null);
            setSelectedArticles([]);
            setSelectedFournisseur(null);
            setGlobalRemise(0);
            setRemiseType("percentage");
            setShowRemise(false);
            setIsCreatingReception(false);
            validation.resetForm();
        } else {
            setModal(true);
        }
    }, [modal]);

    const handleAddArticle = (articleId: string) => {
        const article = articles.find(a => a.id === parseInt(articleId));
        if (article && !selectedArticles.some(item => item.article_id === article.id)) {
            setSelectedArticles([...selectedArticles, {
                article_id: article.id,
                quantite: 0,
               // prixUnitaire: taxMode === "TTC" ? (article.pua_ttc || 0) : (article.pua_ht || 0),
                prixUnitaire: article.pua_ht || 0 ,
                tva: isCreatingReception ? null : article.tva || null,
                remise: 0,
                articleDetails: article
            }]);
        }
    };

    const handleRemoveArticle = (articleId: number) => {
        setSelectedArticles(selectedArticles.filter(item => item.article_id !== articleId));
    };

    const handleArticleChange = (articleId: number, field: string, value: any) => {
        setSelectedArticles(selectedArticles.map(item =>
            item.article_id === articleId ? { ...item, [field]: value } : item
        ));
    };

    const StatusBadge = ({ status }: { status?: "Brouillon" | "Confirme" | "Recu" | "Annule" | "Partiellement Recu" }) => {
        const statusConfig = {
            "Brouillon": {
                bgClass: "bg-warning",
                textClass: "text-warning",
                icon: "ri-draft-line"
            },
            "Confirme": {
                bgClass: "bg-primary",
                textClass: "text-primary",
                icon: "ri-checkbox-circle-line"
            },
            "Recu": {
                bgClass: "bg-success",
                textClass: "text-success",
                icon: "ri-truck-line"
            },
            "Annule": {
                bgClass: "bg-danger",
                textClass: "text-danger",
                icon: "ri-close-circle-line"
            },
            "Partiellement Recu": {
                bgClass: "bg-info",
                textClass: "text-info",
                icon: "ri-truck-line"
            }
        };

        if (!status) return null;

        const config = statusConfig[status] || statusConfig["Brouillon"];

        return (
            <span className={`badge ${config.bgClass}-subtle ${config.textClass} text-uppercase`}>
                <i className={`${config.icon} align-bottom me-1`}></i>
                {status}
            </span>
        );
    };

    const columns = useMemo(
        () => [
            {
                header: "Numéro",
                accessorKey: "numeroCommande",
                enableColumnFilter: false,
                cell: (cell: any) => (
                    <Link to="#" className="text-body fw-medium" onClick={() => openDetailModal(cell.row.original)}>
                        {cell.getValue()}
                    </Link>
                ),
            },
            {
                header: "Date",
                accessorKey: "dateCommande",
                enableColumnFilter: false,
                cell: (cell: any) => moment(cell.getValue()).format("DD MMM YYYY"),
            },
            {
                header: "Fournisseur",
                accessorKey: "fournisseur",
                enableColumnFilter: false,
                cell: (cell: any) => cell.getValue()?.raison_sociale || 'N/A',
            },
            {
                header: "Articles",
                accessorKey: "articles",
                enableColumnFilter: false,
                cell: (cell: any) => (
                    <Badge color="success" className="text-uppercase">
                        {cell.getValue().length} articles
                    </Badge>
                ),
            },
            {
                header: "Total Après Remise",
                accessorKey: "articles",
                enableColumnFilter: false,
                cell: (cell: any) => {
                    let subTotalValue = 0;
                    let totalTaxValue = 0;
                    let grandTotalValue = 0;

                    cell.getValue().forEach((item: any) => {
                        const qty = Number(item.quantite) || 1;
                        const price = Number(item.prixUnitaire) || 0;
                        const tvaRate = Number(item.tva ?? 0);
                        const remiseRate = Number(item.remise || 0);

                        const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                        const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
                        const taxAmount = montantTTCLigne - montantHTLigne;

                        subTotalValue += montantHTLigne;
                        totalTaxValue += taxAmount;
                        grandTotalValue += montantTTCLigne;
                    });

                    const globalDiscount = Number(cell.row.original.remise) || 0;
                    const discountType = cell.row.original.remiseType || "percentage";
                    let finalTotal = grandTotalValue;

                    if (globalDiscount > 0) {
                        if (discountType === "percentage") {
                            finalTotal = grandTotalValue * (1 - globalDiscount / 100);
                        } else {
                            finalTotal = Number(globalDiscount);
                        }
                    }

                    return `${finalTotal.toFixed(2)} DT`;
                },
            },
            {
                header: "Total TTC",
                accessorKey: "articles",
                enableColumnFilter: false,
                cell: (cell: any) => {
                    const total = cell.getValue().reduce((sum: number, item: any) => {
                        const itemTotal = item.quantite * item.prixUnitaire;
                        const itemDiscount = item.remise ? itemTotal * (item.remise / 100) : 0;
                        const taxableAmount = itemTotal - itemDiscount;
                        const itemTax = item.tva ? taxableAmount * (item.tva / 100) : 0;
                        return sum + taxableAmount + itemTax;
                    }, 0);
                    return `${total.toFixed(2)} DT`;
                },
            },
            {
                header: "Statut",
                accessorKey: "status",
                enableColumnFilter: false,
                cell: (cell: any) => <StatusBadge status={cell.getValue()} />,
            },
            {
                header: "Action",
                cell: (cellProps: any) => {
                    return (
                        <ul className="list-inline hstack gap-2 mb-0">
                            <li className="list-inline-item edit">
                                <Link
                                    to="#"
                                    className="text-primary d-inline-block edit-item-btn"
                                    onClick={() => {
                                        setBonCommande(cellProps.row.original);
                                        setSelectedArticles(cellProps.row.original.articles.map((item: any) => ({
                                            article_id: item.article.id,
                                            quantite: item.quantite,
                                            prixUnitaire: parseFloat(item.prixUnitaire),
                                            tva: item.tva != null ? parseFloat(item.tva) : (item.article.tva || null),
                                            remise: item.remise != null ? parseFloat(item.remise) : null,
                                            articleDetails: item.article
                                        })));
                                        setGlobalRemise(cellProps.row.original.remise || 0);
                                        setRemiseType(cellProps.row.original.remiseType || "percentage");
                                        setShowRemise((cellProps.row.original.remise || 0) > 0);
                                        setIsEdit(true);
                                        setModal(true);
                                        setSelectedFournisseur(cellProps.row.original.fournisseur || null);
                                    }}
                                >
                                    <i className="ri-pencil-fill fs-16"></i>
                                </Link>
                            </li>
                            <li className="list-inline-item">
                                <Link
                                    to="#"
                                    className="text-danger d-inline-block remove-item-btn"
                                    onClick={() => {
                                        setBonCommande(cellProps.row.original);
                                        setDeleteModal(true);
                                    }}
                                >
                                    <i className="ri-delete-bin-5-fill fs-16"></i>
                                </Link>
                            </li>
                            <li className="list-inline-item">
                                <Link
                                    to="#"
                                    className="text-info d-inline-block"
                                    onClick={() => openDetailModal(cellProps.row.original)}
                                >
                                    <i className="ri-eye-line fs-16"></i>
                                </Link>
                            </li>
                        </ul>
                    );
                },
            },
        ],
        []
    );

    return (
        <div className="page-content">
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDelete}
                onCloseClick={() => setDeleteModal(false)}
            />

            <Container fluid>
                <BreadCrumb title="Bons de Commande" pageTitle="Commandes" />

                <Row>
                    <Col lg={12}>
                        <Card id="bonCommandeList">
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="card-title mb-0">Gestion des Bons de Commande</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <div className="d-flex gap-1 flex-wrap">
                                            <Button
                                                color="secondary"
                                                onClick={() => {
                                                    setIsEdit(false);
                                                    setIsCreatingReception(false);
                                                    setBonCommande(null);
                                                    toggleModal();
                                                }}
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i> Ajouter Bon
                                            </Button>
                                        </div>
                                    </div>
                                </Row>
                            </CardHeader>
                            <Nav className="nav-tabs nav-tabs-custom nav-success" role="tablist">
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: activeTab === "1" })}
                                        onClick={() => setActiveTab("1")}
                                    >
                                        <i className="ri-list-check-2 me-1 align-bottom"></i> Tous
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: activeTab === "2" })}
                                        onClick={() => setActiveTab("2")}
                                    >
                                        <i className="ri-draft-line me-1 align-bottom"></i> Brouillon
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: activeTab === "3" })}
                                        onClick={() => setActiveTab("3")}
                                    >
                                        <i className="ri-checkbox-circle-line me-1 align-bottom"></i> Confirmé
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: activeTab === "4" })}
                                        onClick={() => setActiveTab("4")}
                                    >
                                        <i className="ri-truck-line me-1 align-bottom"></i> Reçu
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: activeTab === "5" })}
                                        onClick={() => setActiveTab("5")}
                                    >
                                        <i className="ri-truck-line me-1 align-bottom"></i> Partiellement Reçu
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({ active: activeTab === "6" })}
                                        onClick={() => setActiveTab("6")}
                                    >
                                        <i className="ri-close-circle-line me-1 align-bottom"></i> Annulé
                                    </NavLink>
                                </NavItem>
                            </Nav>
                            <CardBody className="pt-3">
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <div className="search-box">
                                            <Input
                                                type="text"
                                                className="form-control"
                                                placeholder="Rechercher..."
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                            <i className="ri-search-line search-icon"></i>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <InputGroup>
                                            <InputGroupText>De</InputGroupText>
                                            <Flatpickr
                                                className="form-control"
                                                options={{
                                                    dateFormat: "d M, Y",
                                                    altInput: true,
                                                    altFormat: "F j, Y",
                                                }}
                                                placeholder="Date de début"
                                                onChange={(dates) => setStartDate(dates[0])}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md={3}>
                                        <InputGroup>
                                            <InputGroupText>À</InputGroupText>
                                            <Flatpickr
                                                className="form-control"
                                                options={{
                                                    dateFormat: "d M, Y",
                                                    altInput: true,
                                                    altFormat: "F j, Y",
                                                }}
                                                placeholder="Date de fin"
                                                onChange={(dates) => setEndDate(dates[0])}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            color="light"
                                            className="w-100"
                                            onClick={() => {
                                                setStartDate(null);
                                                setEndDate(null);
                                                setSearchText("");
                                            }}
                                        >
                                            <i className="ri-close-line align-bottom me-1"></i> Réinitialiser
                                        </Button>
                                    </Col>
                                </Row>

                                {loading ? (
                                    <Loader />
                                ) : error ? (
                                    <div className="text-danger">{error}</div>
                                ) : (
                                    <TableContainer
                                        columns={columns}
                                        data={filteredBonsCommande}
                                        isGlobalFilter={false}
                                        customPageSize={10}
                                        divClass="table-responsive table-card mb-1 mt-0"
                                        tableClass="align-middle table-nowrap"
                                        theadClass="table-light text-muted text-uppercase"
                                    />
                                )}

<Modal isOpen={detailModal} toggle={() => setDetailModal(false)} size="xl" centered>
    <ModalHeader toggle={() => setDetailModal(false)} className="border-0 pb-0">
        <div className="w-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h4 className="mb-2 text-dark fw-bold">Commande #{selectedBonCommande?.numeroCommande}</h4>
                </div>
            </div>
        </div>
    </ModalHeader>

    <ModalBody className="pt-0">
        {selectedBonCommande && (
            <div className="bon-commande-details">
                {/* Fournisseur Information */}
                <Row className="mb-4">
                    <Col md={6}>
                        <div className="border rounded p-3 bg-light">
                            <h6 className="text-muted mb-3 fw-semibold">INFORMATIONS FOURNISSEUR</h6>
                            <div className="space-y-2">
                                <div>
                                    <strong className="text-dark">{selectedBonCommande.fournisseur?.raison_sociale}</strong>
                                </div>
                                <div className="text-muted small">
                                    <div>MF: {selectedBonCommande.fournisseur?.matricule_fiscal}</div>
                                    <div>{selectedBonCommande.fournisseur?.adresse}, {selectedBonCommande.fournisseur?.ville}</div>
                                    <div>{selectedBonCommande.fournisseur?.telephone1}</div>
                                    {selectedBonCommande.fournisseur?.email && (
                                        <div>{selectedBonCommande.fournisseur.email}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="border rounded p-3">
                            <h6 className="text-muted mb-3 fw-semibold">INFORMATIONS COMMANDE</h6>
                            <div className="space-y-2">
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Date création:</span>
                                    <strong>{moment(selectedBonCommande.createdAt).format("DD/MM/YYYY")}</strong>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Statut:</span>
                                    <StatusBadge status={selectedBonCommande.status} />
                                </div>
                        
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Articles Table */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-light border-bottom-0">
                        <h6 className="mb-0 fw-semibold text-dark">ARTICLES COMMANDÉS</h6>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4 fw-semibold text-muted border-0">Article</th>
                                        <th className="fw-semibold text-muted border-0">Référence</th>
                                        <th className="fw-semibold text-muted border-0 text-center">Quantité</th>
                                        <th className="fw-semibold text-muted border-0 text-end">Prix Unitaire</th>
                                        <th className="fw-semibold text-muted border-0 text-center">TVA (%)</th>
                                        <th className="fw-semibold text-muted border-0 text-center">Remise (%)</th>
                                        <th className="fw-semibold text-muted border-0 text-end">Total HT</th>
                                        <th className="fw-semibold text-muted border-0 text-end pe-4">Total TTC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBonCommande.articles.map((item, index) => {
                                        const qty = Number(item.quantite) || 1;
                                        const price = Number(item.prixUnitaire) || 0;
                                        const tvaRate = Number(item.tva ?? 0);
                                        const remiseRate = Number(item.remise || 0);

                                        const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                                        const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));

                                        return (
                                            <tr key={index}>
                                                <td className="ps-4">
                                                    <div className="fw-semibold text-dark">{item.article?.designation}</div>
                                                </td>
                                                <td>
                                                    <code className="text-muted">{item.article?.reference || '-'}</code>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-primary">{qty}</span>
                                                </td>
                                                <td className="text-end">
                                                    <span className="text-dark">{price.toFixed(2)} DT</span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={tvaRate > 0 ? 'badge bg-success' : 'badge bg-secondary'}>
                                                        {tvaRate}%
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={remiseRate > 0 ? 'badge bg-warning' : 'badge bg-secondary'}>
                                                        {remiseRate}%
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <span className="fw-semibold text-dark">{montantHTLigne.toFixed(2)} DT</span>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <span className="fw-bold text-success">{montantTTCLigne.toFixed(2)} DT</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <Row className="justify-content-end">
                    <Col md={6} lg={5}>
                        <div className="card border-0 bg-light">
                            <div className="card-body p-4">
                                <h6 className="text-uppercase text-muted mb-3 fw-semibold border-bottom pb-2">RÉCAPITULATIF</h6>
                                
                                {(() => {
                                    let subTotalValue = 0;
                                    let totalTaxValue = 0;
                                    let grandTotalValue = 0;

                                    selectedBonCommande.articles.forEach(item => {
                                        const qty = Number(item.quantite) || 1;
                                        const price = Number(item.prixUnitaire) || 0;
                                        const tvaRate = Number(item.tva ?? 0);
                                        const remiseRate = Number(item.remise || 0);

                                        const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                                        const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
                                        const taxAmount = montantTTCLigne - montantHTLigne;

                                        subTotalValue += montantHTLigne;
                                        totalTaxValue += taxAmount;
                                        grandTotalValue += montantTTCLigne;
                                    });

                                    const remiseValue = Number(selectedBonCommande.remise) || 0;
                                    const remiseTypeValue = selectedBonCommande.remiseType || "percentage";
                                    let discountAmount = 0;
                                    let finalTotal = grandTotalValue;

                                    if (remiseValue > 0) {
                                        if (remiseTypeValue === "percentage") {
                                            discountAmount = grandTotalValue * (remiseValue / 100);
                                            finalTotal = grandTotalValue * (1 - (remiseValue / 100));
                                        } else {
                                            discountAmount = grandTotalValue - Number(remiseValue);
                                            finalTotal = Number(remiseValue);
                                        }
                                    }

                                    return (
                                        <div className="space-y-2">
                                            <div className="d-flex justify-content-between py-2">
                                                <span className="text-muted">Sous-total HT:</span>
                                                <span className="fw-semibold">{subTotalValue.toFixed(2)} DT</span>
                                            </div>
                                            
                                            <div className="d-flex justify-content-between py-2">
                                                <span className="text-muted">TVA:</span>
                                                <span className="fw-semibold">{totalTaxValue.toFixed(2)} DT</span>
                                            </div>
                                            
                                            <div className="d-flex justify-content-between py-2 border-bottom">
                                                <span className="text-muted">Total TTC:</span>
                                                <span className="fw-semibold">{grandTotalValue.toFixed(2)} DT</span>
                                            </div>
                                            
                                            {remiseValue > 0 && (
                                                <>
                                                    <div className="d-flex justify-content-between py-2">
                                                        <span className="text-danger fw-semibold">Remise ({remiseValue}%):</span>
                                                        <span className="fw-semibold text-danger">- {discountAmount.toFixed(2)} DT</span>
                                                    </div>
                                                    
                                                    <div className="d-flex justify-content-between py-3 mt-2 bg-white rounded px-3 border">
                                                        <span className="fw-bold text-dark">Total après remise:</span>
                                                        <span className="fw-bold fs-5 text-success">{finalTotal.toFixed(2)} DT</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Notes Section */}
                {selectedBonCommande.notes && (
                    <Row className="mt-4">
                        <Col md={8}>
                            <div className="border-start border-3 border-warning bg-warning bg-opacity-10 p-3 rounded">
                                <h6 className="text-muted mb-2 small fw-semibold">NOTES</h6>
                                <p className="mb-0 text-dark">{selectedBonCommande.notes}</p>
                            </div>
                        </Col>
                    </Row>
                )}
            </div>
        )}
    </ModalBody>
    <ModalFooter className="border-top">
        <Button
            color="success"
            size="md"
            className="fw-semibold"
            onClick={() => {
                if (selectedBonCommande) {
                    setBonCommande(selectedBonCommande);
                    setSelectedFournisseur(selectedBonCommande.fournisseur || null);
                    setSelectedArticles(selectedBonCommande.articles.map((item: any) => ({
                        article_id: item.article.id,
                        quantite: item.quantite,
                        prixUnitaire: parseFloat(item.prixUnitaire),
                        tva: item.tva != null ? parseFloat(item.tva) : null,
                        remise: item.remise != null ? parseFloat(item.remise) : null,
                        articleDetails: item.article
                    })));
                    setGlobalRemise(selectedBonCommande.remise || 0);
                    setRemiseType((selectedBonCommande.remiseType as "percentage" | "fixed" | undefined) ?? "percentage");
                    setShowRemise((selectedBonCommande.remise || 0) > 0);
                    setIsCreatingReception(true);
                    setIsEdit(false);

                    validation.setValues({
                        ...validation.values,
                        numeroReception: nextNumeroReception,
                        fournisseur_id: selectedBonCommande.fournisseur?.id ?? "",
                        dateReception: moment().format("YYYY-MM-DD"),
                        status: "Brouillon",
                        notes: selectedBonCommande.notes ?? "",
                        isCreatingReception: true
                    });

                    setModal(true);
                }
            }}
        >
            <i className="ri-truck-line me-2"></i> Créer Bon Réception
        </Button>
    </ModalFooter>
</Modal>

                                <Modal isOpen={modal} toggle={toggleModal} centered size="lg">
                                    <ModalHeader toggle={toggleModal}>
                                        {isCreatingReception
                                            ? "Créer Bon de Réception"
                                            : isEdit
                                                ? "Modifier Bon de Commande"
                                                : "Ajouter Bon de Commande"}
                                    </ModalHeader>
                                    <Form onSubmit={validation.handleSubmit}>
                                        <ModalBody style={{ padding: '20px' }}>
                                            <Row>
                                                {isCreatingReception ? (
                                                    <Col md={4}>
                                                        <div className="mb-3">
                                                            <Label>Numéro de réception*</Label>
                                                            <Input
                                                                name="numeroReception"
                                                                value={validation.values.numeroReception}
                                                                onChange={validation.handleChange}
                                                                onBlur={validation.handleBlur}
                                                                invalid={validation.touched.numeroReception && !!validation.errors.numeroReception}
                                                            />
                                                            <FormFeedback>{validation.errors.numeroReception}</FormFeedback>
                                                        </div>
                                                    </Col>
                                                ) : (
                                                    <Col md={4}>
                                                        <div className="mb-3">
                                                            <Label>Numéro de commande*</Label>
                                                            <Input
                                                                name="numeroCommande"
                                                                value={validation.values.numeroCommande}
                                                                onChange={validation.handleChange}
                                                                onBlur={validation.handleBlur}
                                                                invalid={validation.touched.numeroCommande && !!validation.errors.numeroCommande}
                                                            />
                                                            <FormFeedback>{validation.errors.numeroCommande}</FormFeedback>
                                                        </div>
                                                    </Col>
                                                )}
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>
                                                            {isCreatingReception ? "Date de réception*" : "Date de commande*"}
                                                        </Label>
                                                        <Input
                                                            className="form-control"
                                                            type="date"
                                                            name={isCreatingReception ? "dateReception" : "dateCommande"}
                                                            value={isCreatingReception ? validation.values.dateReception : validation.values.dateCommande}
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={
                                                                isCreatingReception
                                                                    ? validation.touched.dateReception && !!validation.errors.dateReception
                                                                    : validation.touched.dateCommande && !!validation.errors.dateCommande
                                                            }
                                                        />
                                                        <FormFeedback>
                                                            {isCreatingReception
                                                                ? typeof validation.errors.dateReception === 'string'
                                                                    ? validation.errors.dateReception
                                                                    : ''
                                                                : typeof validation.errors.dateCommande === 'string'
                                                                    ? validation.errors.dateCommande
                                                                    : ''}
                                                        </FormFeedback>
                                                    </div>
                                                </Col>
                                         
                                            </Row>

                                            <Row>
                                                <Col md={8}>
                                                    <div className="mb-3">
                                                        <Label>Fournisseur*</Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Rechercher fournisseur (min 3 caractères)"
                                                            value={selectedFournisseur ? selectedFournisseur.raison_sociale : fournisseurSearch}
                                                            onChange={(e) => {
                                                                if (!e.target.value) {
                                                                    setSelectedFournisseur(null);
                                                                    validation.setFieldValue("fournisseur_id", "");
                                                                }
                                                                setFournisseurSearch(e.target.value);
                                                            }}
                                                            readOnly={!!selectedFournisseur}
                                                        />
                                                        {!selectedFournisseur && fournisseurSearch.length >= 3 && (
                                                            <div className="search-results mt-2">
                                                                {filteredFournisseurs.length > 0 ? (
                                                                    <ul className="list-group">
                                                                        {filteredFournisseurs.map(f => (
                                                                            <li
                                                                                key={f.id}
                                                                                className="list-group-item list-group-item-action"
                                                                                onClick={() => {
                                                                                    setSelectedFournisseur(f);
                                                                                    validation.setFieldValue("fournisseur_id", f.id);
                                                                                    setFournisseurSearch("");
                                                                                    setFilteredFournisseurs([]);
                                                                                }}
                                                                            >
                                                                                {f.raison_sociale}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <div className="text-muted">Aucun résultat trouvé</div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {selectedFournisseur && (
                                                            <Button
                                                                color="link"
                                                                size="sm"
                                                                className="mt-1 p-0"
                                                                onClick={() => {
                                                                    setSelectedFournisseur(null);
                                                                    validation.setFieldValue("fournisseur_id", "");
                                                                    setFournisseurSearch("");
                                                                }}
                                                            >
                                                                <i className="ri-close-line"></i> Changer de fournisseur
                                                            </Button>
                                                        )}
                                                        {validation.touched.fournisseur_id && validation.errors.fournisseur_id && (
                                                            <div className="text-danger">{validation.errors.fournisseur_id}</div>
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md={12}>
                                                    <div className="mb-3">
                                                        <Label>Notes</Label>
                                                        <Input
                                                            type="textarea"
                                                            name="notes"
                                                            value={validation.values.notes}
                                                            onChange={validation.handleChange}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row className="mt-3">
                                                <Col md={12}>
                                                    <h5>Articles</h5>
                                                    <div className="mb-3">
                                                        <Input
                                                            type="text"
                                                            placeholder="Rechercher article (min 3 caractères)"
                                                            value={articleSearch}
                                                            onChange={(e) => setArticleSearch(e.target.value)}
                                                        />
                                                        {articleSearch.length >= 3 && (
                                                            <div className="search-results mt-2">
                                                                {filteredArticles.length > 0 ? (
                                                                    <ul className="list-group">
                                                                        {filteredArticles.map(article => (
                                                                            <li
                                                                                key={article.id}
                                                                                className="list-group-item list-group-item-action"
                                                                                onClick={() => {
                                                                                    handleAddArticle(article.id.toString());
                                                                                    setArticleSearch("");
                                                                                    setFilteredArticles([]);
                                                                                }}
                                                                            >
                                                                                {article.reference} - {article.designation} (Stock: {article.qte})
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <div className="text-muted">Aucun résultat trouvé</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row className="mt-3">
                                                <Col md={12}>
                                                    <h5>Remise Globale</h5>
                                                    <Row>
                                                        <Col md={3}>
                                                            <FormGroup check>
                                                                <Input
                                                                    type="checkbox"
                                                                    id="showRemise"
                                                                    checked={showRemise}
                                                                    onChange={(e) => {
                                                                        setShowRemise(e.target.checked);
                                                                        if (!e.target.checked) {
                                                                            setGlobalRemise(0);
                                                                        }
                                                                    }}
                                                                />
                                                                <Label for="showRemise" check>
                                                                    Appliquer une remise
                                                                </Label>
                                                            </FormGroup>
                                                        </Col>
                                                        {showRemise && (
                                                            <>
                                                                <Col md={3}>
                                                                    <div className="mb-3">
                                                                        <Label>Type de remise</Label>
                                                                        <Input
                                                                            type="select"
                                                                            value={remiseType}
                                                                            onChange={(e) => setRemiseType(e.target.value as "percentage" | "fixed")}
                                                                        >
                                                                            <option value="percentage">Pourcentage</option>
                                                                            <option value="fixed">Montant fixe</option>
                                                                        </Input>
                                                                    </div>
                                                                </Col>
                                                                <Col md={3}>
                                                                    <div className="mb-3">
                                                                        <Label>
                                                                            {remiseType === "percentage" ? "Pourcentage de remise" : "Montant de remise (DT)"}
                                                                        </Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={globalRemise}
                                                                            onChange={(e) => setGlobalRemise(Number(e.target.value) || 0)}
                                                                            placeholder={remiseType === "percentage" ? "0-100%" : "Montant en DT"}
                                                                        />
                                                                    </div>
                                                                </Col>
                                                            </>
                                                        )}
                                                    </Row>
                                                </Col>
                                            </Row>

                                            {selectedArticles.length > 0 && (
                                                <>
                                                    <div className="table-responsive">
                                                        <Table className="table table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th>Article</th>
                                                                    <th>Référence</th>
                                                                    <th>Quantité</th>
                                                                    <th>Prix Unitaire</th>
                                                                    <th>TVA (%)</th>
                                                                    <th>Remise (%)</th>
                                                                    <th>Total HT</th>
                                                                    <th>Total TTC</th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {selectedArticles.map((item, index) => {
                                                                    const article = articles.find(a => a.id === item.article_id) || item.articleDetails;
                                                                    const qty = item.quantite || 1;
                                                                    const price = item.prixUnitaire || 0;
                                                                    const tvaRate = item.tva ?? 0;
                                                                    const remiseRate = item.remise || 0;

                                                                    const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                                                                    const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));

                                                                    return (
                                                                        <tr key={`${item.article_id}-${index}`}>
                                                                            <td>{article?.designation}</td>
                                                                            <td>{article?.reference}</td>
                                                                            <td width="100px">
                                                                                <Input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={item.quantite}
                                                                                    onChange={(e) => handleArticleChange(item.article_id, 'quantite', Number(e.target.value))}
                                                                                />
                                                                            </td>
                                                                            <td width="120px">
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    value={item.prixUnitaire}
                                                                                    onChange={(e) => handleArticleChange(item.article_id, 'prixUnitaire', Number(e.target.value))}
                                                                                />
                                                                            </td>
                                                                            <td width="100px">
  {/* Remove the conditional rendering that makes TVA read-only */}
  <Input
    type="select"
    value={item.tva ?? ''}
    onChange={(e) => handleArticleChange(
      item.article_id,
      'tva',
      e.target.value === '' ? null : Number(e.target.value)
    )}
  >
    <option value="">Sélectionner TVA</option>
    {tvaOptions.map(option => (
      <option
        key={option.value ?? 'null'}
        value={option.value ?? ''}
      >
        {option.label}
      </option>
    ))}
  </Input>
</td>
                                                                            <td width="100px">
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    value={item.remise ?? 0}
                                                                                    onChange={(e) => handleArticleChange(item.article_id, 'remise', Number(e.target.value))}
                                                                                />
                                                                            </td>
                                                                            <td>{montantHTLigne.toFixed(2)} TND</td>
                                                                            <td>{montantTTCLigne.toFixed(2)} TND</td>
                                                                            <td>
                                                                                <Button
                                                                                    color="danger"
                                                                                    size="sm"
                                                                                    onClick={() => handleRemoveArticle(item.article_id)}
                                                                                >
                                                                                    <i className="ri-delete-bin-line"></i>
                                                                                </Button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </Table>
                                                    </div>

                                                    <Row className="mt-3 justify-content-end">
                                                    <Table className="table table-bordered">
    <tbody>
        <tr>
            <th>Sous-total HT</th>
            <td className="text-end">{subTotal} TND</td>
        </tr>
        <tr>
            <th>TVA</th>
            <td className="text-end">{totalTax} TND</td>
        </tr>
        <tr>
            <th>Total TTC</th>
            <td className="text-end">{totalTTCBeforeRemise} TND</td>
        </tr>
        {showRemise && globalRemise > 0 && (
            <tr>
                <th>
                    {remiseType === "percentage" ? `Remise (${globalRemise}%)` : "Remise (Montant fixe)"}
                </th>
                <td className="text-end text-danger">
                    - {remiseType === "percentage" ? 
                        ((Number(subTotal) + Number(totalTax)) * (globalRemise / 100)).toFixed(2)
                        : ((Number(subTotal) + Number(totalTax)) - Number(globalRemise)).toFixed(2)} TND
                </td>
            </tr>
        )}
        {showRemise && globalRemise > 0 && (
            <tr className="table-active">
                <th>Total TTC Après Remise</th>
                <td className="text-end fw-bold">{grandTotal} TND</td>
            </tr>
        )}
    </tbody>
</Table>
                                                    </Row>
                                                </>
                                            )}
                                        </ModalBody>
                                        <div className="modal-footer">
                                            <Button color="light" onClick={toggleModal}>
                                                <i className="ri-close-line align-bottom me-1"></i> Fermer
                                            </Button>
                                            <Button
                                                color="primary"
                                                type="submit"
                                                disabled={selectedArticles.length === 0 || !selectedFournisseur}
                                            >
                                                <i className="ri-save-line align-bottom me-1"></i> {isEdit ? "Modifier" : "Enregistrer"}
                                            </Button>
                                        </div>
                                    </Form>
                                </Modal>
                                <ToastContainer />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BonCommandeList;