import React, { Fragment, useEffect, useState, useMemo, useCallback } from "react";
import {
    Card, CardBody, Col, Container, CardHeader, Row, Modal, ModalHeader, Nav,
    NavItem, NavLink, Form, ModalBody, ModalFooter, Label, Input, FormFeedback,
    Badge, Table, Button, InputGroupText, InputGroup, FormGroup
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
    fetchBonsReception, createBonReception, updateBonReception, deleteBonReception,
    fetchNextReceptionNumberFromAPI
} from "../../../Components/BonReception/BonReceptionServices";
import { fetchArticles, fetchFournisseurs } from "../../../Components/Article/ArticleServices";
import { createFacture, fetchNextFactureNumberFromAPI } from "../../../Components/Article/FactureServices";
import { Article, Fournisseur, BonReception } from "../../../Components/Article/Interfaces";
import classnames from "classnames";

const BonReceptionList = () => {
    const [detailModal, setDetailModal] = useState(false);
    const [factureModal, setFactureModal] = useState(false);
    const [selectedBonReception, setSelectedBonReception] = useState<BonReception | null>(null);
    const [activeTab, setActiveTab] = useState("1");
    const [modal, setModal] = useState(false);
    const [bonsReception, setBonsReception] = useState<BonReception[]>([]);
    const [filteredBonsReception, setFilteredBonsReception] = useState<BonReception[]>([]);
    const [bonReception, setBonReception] = useState<BonReception | null>(null);
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [isCreatingFacture, setIsCreatingFacture] = useState(false);
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
    const [nextNumeroFacture, setNextNumeroFacture] = useState("");
    const [nextNumeroReception, setNextNumeroReception] = useState("");
    const [timbreFiscal, setTimbreFiscal] = useState<boolean>(false);

    const conditionPaiementOptions = [
        { value: "7", label: "7 jours" },
        { value: "15", label: "15 jours" },
        { value: "30", label: "30 jours" },
        { value: "60", label: "60 jours" },
        { value: "90", label: "90 jours" }
    ];

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
                fetchBonsReception(),
                fetchFournisseurs(),
                fetchArticles()
            ]);

            setBonsReception(bonsData);
            setFilteredBonsReception(bonsData);
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

    const fetchNextFactureNumber = useCallback(async () => {
        try {
            const numero = await fetchNextFactureNumberFromAPI();
            setNextNumeroFacture(numero);
        } catch (err) {
            toast.error("Échec de la récupération du numéro de facture");
            const year = moment().format('YYYY');
            const nextNum = `FAC-${String(bonsReception.length + 1).padStart(4, '0')}/${year}`;
            setNextNumeroFacture(nextNum);
        }
    }, [bonsReception]);

    const fetchNextReceptionNumber = useCallback(async () => {
        try {
            const numero = await fetchNextReceptionNumberFromAPI();
            setNextNumeroReception(numero);
        } catch (err) {
            toast.error("Échec de la récupération du numéro de réception");
            const year = moment().format('YYYY');
            const nextNum = `REC-${String(bonsReception.length + 1).padStart(4, '0')}/${year}`;
            setNextNumeroReception(nextNum);
        }
    }, [bonsReception]);

    useEffect(() => {
        if (modal && !isEdit && !isCreatingFacture) {
            fetchNextReceptionNumber();
        }
        if (factureModal && !isEdit) {
            fetchNextFactureNumber();
        }
    }, [modal, factureModal, isEdit, isCreatingFacture, fetchNextReceptionNumber, fetchNextFactureNumber]);

    useEffect(() => {
        let result = [...bonsReception];

        if (activeTab === "2") {
            result = result.filter(bon => bon.status === "Brouillon");
        } else if (activeTab === "3") {
            result = result.filter(bon => bon.status === "Recu");
        } else if (activeTab === "4") {
            result = result.filter(bon => bon.status === "Partiellement Recu");
        } else if (activeTab === "5") {
            result = result.filter(bon => bon.status === "Annule");
        }

        if (startDate && endDate) {
            const start = moment(startDate).startOf('day');
            const end = moment(endDate).endOf('day');

            result = result.filter(bon => {
                const bonDate = moment(bon.dateReception);
                return bonDate.isBetween(start, end, null, '[]');
            });
        }

        if (searchText) {
            const searchLower = searchText.toLowerCase();
            result = result.filter(bon =>
                bon.numeroReception.toLowerCase().includes(searchLower) ||
                (bon.fournisseur?.raison_sociale && bon.fournisseur.raison_sociale.toLowerCase().includes(searchLower))
            );
        }

        setFilteredBonsReception(result);
    }, [activeTab, startDate, endDate, searchText, bonsReception]);

    const openDetailModal = (bonReception: BonReception) => {
        setSelectedBonReception(bonReception);
        setDetailModal(true);
    };

    const { subTotal, totalTax, grandTotal } = useMemo(() => {
        if (selectedArticles.length === 0) {
            return {
                subTotal: "0",
                totalTax: "0",
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
        if (showRemise && Number(globalRemise) > 0) {
            if (remiseType === "percentage") {
                grandTotalValue = grandTotalValue * (1 - (Number(globalRemise) / 100));
            } else {
                grandTotalValue = Number(globalRemise); // Fixed remise is the final amount
            }
        }
        return {
            subTotal: subTotalValue.toFixed(3),
            totalTax: totalTaxValue.toFixed(3),
            grandTotal: grandTotalValue.toFixed(3)
        };
    }, [selectedArticles, showRemise, globalRemise, remiseType]);

    const handleDelete = async () => {
        if (!bonReception) return;

        try {
            await deleteBonReception(bonReception.id);
            setDeleteModal(false);
            fetchData();
            toast.success("Bon de réception supprimé avec succès");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de la suppression");
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const receptionData = {
                ...values,
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
                totalTTC: grandTotal,
                timbreFiscal: isCreatingFacture ? timbreFiscal : false
            };
            if (isCreatingFacture) {
                receptionData.bonReception_id = bonReception?.id;
                await createFacture(receptionData);
                toast.success("Facture créée avec succès");
            } else {
                if (isEdit && bonReception) {
                    await updateBonReception(bonReception.id, receptionData);
                    toast.success("Bon de réception mis à jour avec succès");
                } else {
                    await createBonReception(receptionData);
                    toast.success("Bon de réception créé avec succès");
                }
            }
            setModal(false);
            setFactureModal(false);
            fetchData();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de l'opération");
        }
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            numeroReception: isEdit ? (bonReception?.numeroReception || "") : nextNumeroReception,
            numeroFacture: isCreatingFacture ? nextNumeroFacture : "",
            fournisseur_id: bonReception?.fournisseur?.id ?? "",
            dateReception: bonReception?.dateReception ? moment(bonReception.dateReception).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
            dateFacture: moment().format("YYYY-MM-DD"),
            dateEcheance: "",
            conditionPaiement: "",
            notes: bonReception?.notes ?? "",
            isCreatingFacture: isCreatingFacture
        },
        validationSchema: Yup.object({
            numeroReception: Yup.string().when('isCreatingFacture', {
                is: false,
                then: (schema) => schema.required("Le numéro est requis")
            }),
            numeroFacture: Yup.string().when('isCreatingFacture', {
                is: true,
                then: (schema) => schema.required("Le numéro de facture est requise")
            }),
            fournisseur_id: Yup.number().required("Le fournisseur est requis"),
            dateReception: Yup.date().when('isCreatingFacture', {
                is: false,
                then: (schema) => schema.required("La date est requise")
            }),
            dateFacture: Yup.date().when('isCreatingFacture', {
                is: true,
                then: (schema) => schema.required("La date de facture est requise")
            }),
            dateEcheance: Yup.date().when('isCreatingFacture', {
                is: true,
                then: (schema) => schema.required("La date d'échéance est requise")
            }),
            conditionPaiement: Yup.string().when('isCreatingFacture', {
                is: true,
                then: (schema) => schema.required("La condition de paiement est requise")
            }),
        }),
        onSubmit: handleSubmit
    });

    const toggleModal = useCallback(() => {
        if (modal) {
            setModal(false);
            setBonReception(null);
            setSelectedArticles([]);
            setSelectedFournisseur(null);
            setGlobalRemise(0);
            setRemiseType("percentage");
            setShowRemise(false);
            setIsCreatingFacture(false);
            setTimbreFiscal(false);
            validation.resetForm();
        } else {
            setModal(true);
        }
    }, [modal]);
    
    const toggleFactureModal = useCallback(() => {
        if (factureModal) {
            setFactureModal(false);
            setBonReception(null);
            setSelectedArticles([]);
            setSelectedFournisseur(null);
            setGlobalRemise(0);
            setRemiseType("percentage");
            setShowRemise(false);
            setIsCreatingFacture(false);
            setTimbreFiscal(false);
            validation.resetForm();
        } else {
            setFactureModal(true);
        }
    }, [factureModal]);

    const handleAddArticle = (articleId: string) => {
        const article = articles.find(a => a.id === parseInt(articleId));
        if (article && !selectedArticles.some(item => item.article_id === article.id)) {
          setSelectedArticles([...selectedArticles, {
            article_id: article.id,
            quantite: 0, // Ensure valid quantity
            prixUnitaire: article.pua_ht || 0, // Ensure valid price
            tva: article.tva || null, // Initialize with article's TVA or null
            remise: article.remise || 0, // Initialize with 0 or article's remise
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

    const StatusBadge = ({ status }: { status?: "Brouillon" | "Recu" | "Partiellement Recu" | "Annule" | "Validee" | "Payee" }) => {
        const statusConfig = {
            "Brouillon": { bgClass: "bg-warning", textClass: "text-warning", icon: "ri-time-line" },
            "Recu": { bgClass: "bg-success", textClass: "text-success", icon: "ri-checkbox-circle-line" },
            "Partiellement Recu": { bgClass: "bg-info", textClass: "text-info", icon: "ri-truck-line" },
            "Annule": { bgClass: "bg-danger", textClass: "text-danger", icon: "ri-close-circle-line" },
            "Validee": { bgClass: "bg-primary", textClass: "text-primary", icon: "ri-checkbox-circle-line" },
            "Payee": { bgClass: "bg-success", textClass: "text-success", icon: "ri-money-dollar-circle-line" }
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
                accessorKey: "numeroReception",
                enableColumnFilter: false,
                cell: (cell: any) => (
                    <Link to="#" className="text-body fw-medium" onClick={() => openDetailModal(cell.row.original)}>
                        {cell.getValue()}
                    </Link>
                ),
            },
            {
                header: "Date",
                accessorKey: "dateReception",
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
                header: "Total TTC",
                accessorKey: "articles",
                enableColumnFilter: false,
                cell: (cell: any) => {
                    let grandTotalValue = 0;
    
                    cell.getValue().forEach((item: any) => {
                        const qty = Number(item.quantite) || 1;
                        const price = Number(item.prixUnitaire) || 0;
                        const tvaRate = Number(item.tva ?? 0);
                        const remiseRate = Number(item.remise || 0);
    
                        const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                        const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
    
                        grandTotalValue += montantTTCLigne;
                    });
    
                    return `${grandTotalValue.toFixed(2)} DT`;
                },
            },
            {
                header: "Total TTC Après Remise",
                accessorKey: "articles",
                enableColumnFilter: false,
                cell: (cell: any) => {
                    let grandTotalValue = 0;
    
                    cell.getValue().forEach((item: any) => {
                        const qty = Number(item.quantite) || 1;
                        const price = Number(item.prixUnitaire) || 0;
                        const tvaRate = Number(item.tva ?? 0);
                        const remiseRate = Number(item.remise || 0);
    
                        const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                        const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
    
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
    
                    return finalTotal > 0 ? `${finalTotal.toFixed(2)} DT` : "-";
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
                                        setBonReception(cellProps.row.original);
                                        setSelectedArticles(cellProps.row.original.articles.map((item: any) => ({
                                            article_id: item.article.id,
                                            quantite: item.quantite,
                                            quantiteRecue: item.quantiteRecue,
                                            prixUnitaire: parseFloat(item.prixUnitaire),
                                            tva: item.tva != null ? parseFloat(item.tva) : null,
                                            remise: item.remise != null ? parseFloat(item.remise) : null,
                                            articleDetails: item.article
                                        })));
                                        setGlobalRemise(cellProps.row.original.remise || 0);
                                        setRemiseType(cellProps.row.original.remiseType || "percentage");
                                        setShowRemise((cellProps.row.original.remise || 0) > 0);
                                        setSelectedFournisseur(cellProps.row.original.fournisseur || null);
                                        setIsEdit(true);
                                        setModal(true);
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
                                        setBonReception(cellProps.row.original);
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
                <BreadCrumb title="Bons de Réception" pageTitle="Réceptions" />

                <Row>
                    <Col lg={12}>
                        <Card id="bonReceptionList">
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="card-title mb-0">Gestion des Bons de Réception</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <div className="d-flex gap-1 flex-wrap">
                                            <Button
                                                color="secondary"
                                                onClick={() => {
                                                    setIsEdit(false);
                                                    setBonReception(null);
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
                                    <NavLink className={classnames({ active: activeTab === "1" })} onClick={() => setActiveTab("1")}>
                                        <i className="ri-list-check-2 me-1 align-bottom"></i> Tous
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === "2" })} onClick={() => setActiveTab("2")}>
                                        <i className="ri-time-line me-1 align-bottom"></i> Brouillon
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === "3" })} onClick={() => setActiveTab("3")}>
                                        <i className="ri-checkbox-circle-line me-1 align-bottom"></i> Reçu
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === "4" })} onClick={() => setActiveTab("4")}>
                                        <i className="ri-truck-line me-1 align-bottom"></i> Partiellement Reçu
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === "5" })} onClick={() => setActiveTab("5")}>
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
                                                options={{ dateFormat: "d M, Y", altInput: true, altFormat: "F j, Y" }}
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
                                                options={{ dateFormat: "d M, Y", altInput: true, altFormat: "F j, Y" }}
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
                                        data={filteredBonsReception}
                                        isGlobalFilter={false}
                                        customPageSize={10}
                                        divClass="table-responsive table-card mb-1 mt-0"
                                        tableClass="align-middle table-nowrap"
                                        theadClass="table-light text-muted text-uppercase"
                                    />
                                )}

                                <Modal isOpen={detailModal} toggle={() => setDetailModal(false)} size="lg" centered>
                                    <ModalHeader toggle={() => setDetailModal(false)} className="border-0 pb-2">
                                        <div className="d-flex justify-content-between align-items-center w-100">
                                            <div>
                                                <h5 className="mb-1">Bon de Réception #{selectedBonReception?.numeroReception}</h5>
                                                <div className="d-flex align-items-center">
                                                    <StatusBadge status={selectedBonReception?.status} />
                                                    <small className="text-muted ms-2">
                                                        {moment(selectedBonReception?.dateReception).format("DD MMM YYYY")}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </ModalHeader>

                                    <ModalBody className="pt-0">
                                        {selectedBonReception && (
                                            <div className="bon-reception-details">
                                                <Row className="g-3 mb-3">
                                                    <Col md={6}>
                                                        <Card className="border">
                                                            <CardBody className="p-3">
                                                                <h6 className="text-uppercase text-muted fs-12 mb-3">Fournisseur</h6>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="flex-grow-1">
                                                                        <h5 className="mb-1">{selectedBonReception.fournisseur?.raison_sociale}</h5>
                                                                        <p className="text-muted mb-1 small">
                                                                            <i className="ri-map-pin-line me-1"></i>
                                                                            {selectedBonReception.fournisseur?.adresse}, {selectedBonReception.fournisseur?.ville}
                                                                        </p>
                                                                        <p className="text-muted mb-0 small">
                                                                            <i className="ri-file-text-line me-1"></i>
                                                                            MF: {selectedBonReception.fournisseur?.matricule_fiscal}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>

                                                    <Col md={6}>
                                                        <Card className="border">
                                                            <CardBody className="p-3">
                                                                <h6 className="text-uppercase text-muted fs-12 mb-3">Informations</h6>
                                                                <div className="row g-2">
                                                                    <div className="col-6">
                                                                        <p className="mb-1 small">
                                                                            <span className="text-muted">Créé le:</span><br />
                                                                            {moment(selectedBonReception.createdAt).format("DD/MM/YYYY")}
                                                                        </p>
                                                                    </div>
                                                                    <div className="col-6">
                                                                        <p className="mb-1 small">
                                                                            <span className="text-muted">Remise Globale:</span><br />
                                                                            {selectedBonReception.remise && selectedBonReception.remiseType === "percentage" ? `${selectedBonReception.remise}%` : selectedBonReception.remise ? `${selectedBonReception.remise} DT` : "0%"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                </Row>

                                                {selectedBonReception.notes && (
                                                    <Card className="border mb-3">
                                                        <CardBody className="p-3">
                                                            <h6 className="text-uppercase text-muted fs-12 mb-2">Notes</h6>
                                                            <p className="mb-0">{selectedBonReception.notes}</p>
                                                        </CardBody>
                                                    </Card>
                                                )}

                                                <Card className="border">
                                                    <CardBody className="p-0">
                                                    <div className="table-responsive">
    <Table className="table-borderless mb-0">
      <thead className="table-light">
        <tr>
          <th className="ps-3">Article</th>
          <th>Référence</th>
          <th className="text-end">Quantité</th>
          <th className="text-end">Prix Unitaire</th>
          <th className="text-end">TVA (%)</th>
          <th className="text-end">Remise (%)</th>
          <th className="text-end">Total HT</th>
          <th className="text-end pe-3">Total TTC</th>
        </tr>
      </thead>
      <tbody>
        {selectedBonReception.articles.map((item, index) => {
          const qty = Number(item.quantite) || 1;
          const price = Number(item.prixUnitaire) || 0;
          const tvaRate = Number(item.tva ?? 0);
          const remiseRate = Number(item.remise || 0);

          const montantHTLigne = qty * price * (1 - (remiseRate / 100));
          const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));

          return (
            <tr key={index} className={index % 2 === 0 ? "bg-light" : ""}>
              <td className="ps-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fs-14">{item.article?.designation}</h6>
                  </div>
                </div>
              </td>
              <td>
                <span className="text-muted">{item.article?.reference || '-'}</span>
              </td>
              <td className="text-end">{qty}</td>
              <td className="text-end">{price.toFixed(2)}</td>
              <td className="text-end">{tvaRate}</td>
              <td className="text-end">{remiseRate}</td>
              <td className="text-end">{montantHTLigne.toFixed(2)} DT</td>
              <td className="text-end pe-3 fw-medium">{montantTTCLigne.toFixed(2)} DT</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  </div>

                                                        <div className="border-top p-3">
                                                            <Row className="justify-content-end">
                                                                <Col xs={8} sm={6} md={5} lg={4}>
                                                                {(() => {
    let subTotalValue = 0;
    let totalTaxValue = 0;
    let grandTotalValue = 0;

    selectedBonReception.articles.forEach(item => {
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

    const remiseValue = Number(selectedBonReception.remise) || 0;
    const remiseTypeValue = selectedBonReception.remiseType || "percentage";
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
        <Table className="table-sm table-borderless mb-0">
            <tbody>
                <tr>
                    <th className="text-end">Sous-total HT:</th>
                    <td className="text-end">{subTotalValue.toFixed(3)} DT</td>
                </tr>
                <tr>
                    <th className="text-end">TVA:</th>
                    <td className="text-end">{totalTaxValue.toFixed(3)} DT</td>
                </tr>
                <tr>
                    <th className="text-end">Total TTC:</th>
                    <td className="text-end">{grandTotalValue.toFixed(3)} DT</td>
                </tr>
                {remiseValue > 0 && (
                    <tr>
                        <th className="text-end">
                            {remiseTypeValue === "percentage" ? `Remise (${remiseValue.toFixed(2)}%)` : "Remise (Montant fixe)"}
                        </th>
                        <td className="text-end text-danger">
                            - {discountAmount.toFixed(3)} DT
                        </td>
                    </tr>
                )}
                {remiseValue > 0 && (
                    <tr className="border-top">
                        <th className="text-end">Total Après Remise:</th>
                        <td className="text-end fw-bold">{finalTotal.toFixed(3)} DT</td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
})()}
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </div>
                                        )}
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button
                                            color="primary"
                                            size="md"
                                            onClick={() => {
                                                setDetailModal(false);
                                                setBonReception(selectedBonReception);
                                                setSelectedArticles(selectedBonReception?.articles.map(item => ({
                                                    article_id: item.article.id,
                                                    quantite: item.quantite,
                                                    prixUnitaire: item.prixUnitaire,
                                                    tva: item.tva,
                                                    remise: item.remise,
                                                    articleDetails: item.article
                                                })) || []);
                                                setGlobalRemise(selectedBonReception?.remise || 0);
                                                setRemiseType((selectedBonReception?.remiseType as "percentage" | "fixed" | undefined) ?? "percentage");
                                                setShowRemise((selectedBonReception?.remise || 0) > 0);
                                                setIsEdit(true);
                                                setModal(true);
                                            }}
                                        >
                                            <i className="ri-edit-line me-1"></i> Modifier
                                        </Button>
                                        <Button
                                            color="success"
                                            size="md"
                                            onClick={() => {
                                                if (selectedBonReception) {
                                                    setBonReception(selectedBonReception);
                                                    setSelectedFournisseur(selectedBonReception.fournisseur || null);
                                                    setSelectedArticles(selectedBonReception.articles.map((item: any) => ({
                                                        article_id: item.article.id,
                                                        quantite: item.quantite,
                                                        prixUnitaire: parseFloat(item.prixUnitaire),
                                                        tva: item.tva != null ? parseFloat(item.tva) : null,
                                                        remise: item.remise != null ? parseFloat(item.remise) : null,
                                                        articleDetails: item.article
                                                    })));
                                                    setGlobalRemise(selectedBonReception.remise || 0);
                                                    setRemiseType((selectedBonReception.remiseType as "percentage" | "fixed" | undefined) ?? "percentage");
                                                    setShowRemise((selectedBonReception.remise || 0) > 0);
                                                    setIsCreatingFacture(true);
                                                    setIsEdit(false);

                                                    validation.setValues({
                                                        ...validation.values,
                                                        numeroFacture: nextNumeroFacture,
                                                        fournisseur_id: selectedBonReception.fournisseur?.id ?? "",
                                                        dateFacture: moment().format("YYYY-MM-DD"),
                                                        dateEcheance: "",
                            
                                                        notes: selectedBonReception.notes ?? "",
                                                        isCreatingFacture: true
                                                    });

                                                    setFactureModal(true);
                                                }
                                            }}
                                        >
                                            <i className="ri-file-text-line me-1"></i> Créer Facture
                                        </Button>
                                    </ModalFooter>
                                </Modal>

                                <Modal isOpen={modal} toggle={toggleModal} centered size="lg">
                                    <ModalHeader toggle={toggleModal}>
                                        {isEdit ? "Modifier Bon de Réception" : "Ajouter Bon de Réception"}
                                    </ModalHeader>
                                    <Form onSubmit={validation.handleSubmit}>
                                        <ModalBody style={{ padding: '20px' }}>
                                            <Row>
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
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>Date de réception*</Label>
                                                        <Input
                                                            className="form-control"
                                                            type="date"
                                                            name="dateReception"
                                                            value={validation.values.dateReception}
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={validation.touched.dateReception && !!validation.errors.dateReception}
                                                        />
                                                        <FormFeedback>
                                                            {typeof validation.errors.dateReception === "string" && validation.errors.dateReception}
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
                                                                                        <option key={option.value ?? 'null'} value={option.value ?? ''}>
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
            <td className="text-end">{(Number(subTotal) + Number(totalTax)).toFixed(3)} TND</td>
        </tr>
        {showRemise && globalRemise > 0 && (
            <tr>
                <th>
                    {remiseType === "percentage" ? `Remise (${globalRemise}%)` : "Remise (Montant fixe)"}
                </th>
                <td className="text-end text-danger">
                    - {remiseType === "percentage" ? 
                        ((Number(subTotal) + Number(totalTax)) * (globalRemise / 100)).toFixed(3)
                        : ((Number(subTotal) + Number(totalTax)) - Number(globalRemise)).toFixed(3)} TND
                </td>
            </tr>
        )}
        {showRemise && globalRemise > 0 && (
            <tr className="table-active">
                <th>Total Après Remise</th>
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

                                <Modal isOpen={factureModal} toggle={toggleFactureModal} centered size="lg">
                                    <ModalHeader toggle={toggleFactureModal}>
                                        Créer Facture
                                    </ModalHeader>
                                    <Form onSubmit={validation.handleSubmit}>
                                        <ModalBody style={{ padding: '20px' }}>
                                            <Row>
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>Numéro de facture*</Label>
                                                        <Input
                                                            name="numeroFacture"
                                                            value={validation.values.numeroFacture}
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={validation.touched.numeroFacture && !!validation.errors.numeroFacture}
                                                        />
                                                        <FormFeedback>{validation.errors.numeroFacture}</FormFeedback>
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>Date de facture*</Label>
                                                        <Input
                                                            className="form-control"
                                                            type="date"
                                                            name="dateFacture"
                                                            value={validation.values.dateFacture}
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={validation.touched.dateFacture && !!validation.errors.dateFacture}
                                                        />
                                                        <FormFeedback>
                                                            {typeof validation.errors.dateFacture === "string" && validation.errors.dateFacture}
                                                        </FormFeedback>
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>Date d'échéance*</Label>
                                                        <Input
                                                            className="form-control"
                                                            type="date"
                                                            name="dateEcheance"
                                                            value={validation.values.dateEcheance}
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            invalid={validation.touched.dateEcheance && !!validation.errors.dateEcheance}
                                                        />
                                                        <FormFeedback>
                                                            {typeof validation.errors.dateEcheance === "string" && validation.errors.dateEcheance}
                                                        </FormFeedback>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row>
                <Col md={4}>
                    <div className="mb-3">
                        <Label>Condition de paiement*</Label>
                        <Input
                            type="select"
                            name="conditionPaiement"
                            value={validation.values.conditionPaiement}
                            onChange={validation.handleChange}
                            onBlur={validation.handleBlur}
                            invalid={validation.touched.conditionPaiement && !!validation.errors.conditionPaiement}
                        >
                            <option value="">Sélectionner</option>
                            {conditionPaiementOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Input>
                        <FormFeedback>{validation.errors.conditionPaiement}</FormFeedback>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="mb-3">
                        <FormGroup check>
                            <Input
                                type="checkbox"
                                id="timbreFiscal"
                                checked={timbreFiscal}
                                onChange={(e) => setTimbreFiscal(e.target.checked)}
                            />
                            <Label for="timbreFiscal" check>
                                Appliquer Timbre Fiscal (1 TND)
                            </Label>
                        </FormGroup>
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
                                                                                        <option key={option.value ?? 'null'} value={option.value ?? ''}>
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
            {timbreFiscal && (
                <tr>
                    <th>Timbre Fiscal</th>
                    <td className="text-end">1.000 TND</td>
                </tr>
            )}
            <tr>
                <th>Total TTC</th>
                <td className="text-end">{(Number(subTotal) + Number(totalTax) + (timbreFiscal && !showRemise ? 1 : 0)).toFixed(3)} TND</td>
            </tr>
            {showRemise && globalRemise > 0 && (
                <tr>
                    <th>
                        {remiseType === "percentage" ? `Remise (${globalRemise}%)` : "Remise (Montant fixe)"}
                    </th>
                    <td className="text-end text-danger">
                        - {remiseType === "percentage" ? 
                            ((Number(subTotal) + Number(totalTax)) * (globalRemise / 100)).toFixed(3)
                            : ((Number(subTotal) + Number(totalTax)) - Number(globalRemise)).toFixed(3)} TND
                    </td>
                </tr>
            )}
            {showRemise && globalRemise > 0 && (
                <tr>
                    <th>Total Après Remise</th>
                    <td className="text-end fw-bold">{(Number(grandTotal) + (timbreFiscal ? 1 : 0)).toFixed(3)} TND</td>
                </tr>
            )}
        </tbody>
    </Table>
</Row>
                                                </>
                                            )}
                                        </ModalBody>
                                        <div className="modal-footer">
                                            <Button color="light" onClick={toggleFactureModal}>
                                                <i className="ri-close-line align-bottom me-1"></i> Fermer
                                            </Button>
                                            <Button
                                                color="primary"
                                                type="submit"
                                                disabled={selectedArticles.length === 0 || !selectedFournisseur}
                                            >
                                                <i className="ri-save-line align-bottom me-1"></i> Enregistrer
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

export default BonReceptionList;