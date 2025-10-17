import React, { useEffect, useState, useMemo, useCallback } from "react";
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
    fetchFactures, createFacture, updateFacture, deleteFacture,
    fetchNextFactureNumberFromAPI, createPayment, fetchPayments, fetchNextPaymentNumberFromAPI
} from "../../../Components/Article/FactureServices";
import { fetchArticles, fetchFournisseurs } from "../../../Components/Article/ArticleServices";
import { Article, Fournisseur, FactureFournisseur, Payment } from "../../../Components/Article/Interfaces";
import classnames from "classnames";
import FacturePDFModal from "./FacturePDFModal";
import { useProfile } from "Components/Hooks/UserHooks";
import logo from '../../../assets/images/imglogo.png'
const FactureList = () => {
    const [detailModal, setDetailModal] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);
    const [createEditModal, setCreateEditModal] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState<FactureFournisseur | null>(null);
    const [facture, setFacture] = useState<FactureFournisseur | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [activeTab, setActiveTab] = useState("1");
    const [factures, setFactures] = useState<FactureFournisseur[]>([]);
    const [filteredFactures, setFilteredFactures] = useState<FactureFournisseur[]>([]);
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [searchText, setSearchText] = useState("");
    const [nextPaymentNumber, setNextPaymentNumber] = useState("");
    const [articleSearch, setArticleSearch] = useState("");
    const [fournisseurSearch, setFournisseurSearch] = useState("");
    const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [filteredFournisseurs, setFilteredFournisseurs] = useState<Fournisseur[]>([]);
    const [showRemise, setShowRemise] = useState(false);

    //
    const { userProfile, loading: profileLoading } = useProfile();


    const [nextFactureNumber, setNextFactureNumber] = useState("");
    const [selectedArticles, setSelectedArticles] = useState<{
        article_id: number;
        quantite: number;
        prixUnitaire: number;
        tva?: number | null;
        remise?: number | null;
        articleDetails?: Article;
    }[]>([]);
    const [remiseType, setRemiseType] = useState<"percentage" | "fixed">("percentage");
    const [globalRemise, setGlobalRemise] = useState<number>(0);
    const [taxMode, setTaxMode] = useState<"HT" | "TTC">("HT");
    const [timbreFiscal, setTimbreFiscal] = useState<boolean>(false);

    const tvaOptions = [
        { value: null, label: "Non applicable" },
        { value: 0, label: "0% (Exonéré)" },
        { value: 7, label: "7%" },
        { value: 10, label: "10%" },
        { value: 13, label: "13%" },
        { value: 19, label: "19%" },
        { value: 21, label: "21%" }
    ];

    const [pdfModal, setPdfModal] = useState(false);
    const [selectedFactureForPdf, setSelectedFactureForPdf] = useState<FactureFournisseur | null>(null);

    const companyInfo = useMemo(() => ({
        name: userProfile?.company_name ,
        address: userProfile?.company_address ,
        city: userProfile?.company_city ,
        phone: userProfile?.company_phone ,
        email: userProfile?.company_email ,
        website: userProfile?.company_website ,
        taxId: userProfile?.company_tax_id,
        logo: logo,
    }), [userProfile]);

    const openPdfModal = (facture: FactureFournisseur) => {
        setSelectedFactureForPdf(facture);
        setPdfModal(true);
    };

    useEffect(() => {
        const fetchNextNumber = async () => {
            try {
                const nextNumber = await fetchNextFactureNumberFromAPI();
                setNextFactureNumber(nextNumber);
            } catch (err) {
                console.error("Failed to fetch next invoice number:", err);
                const year = moment().format('YYYY');
                const defaultNumber = `FAC-${year}${String(factures.length + 1).padStart(5, '0')}`;
                setNextFactureNumber(defaultNumber);
            }
        };

        if (!isEdit) {
            fetchNextNumber();
        }
    }, [isEdit, factures.length]);

    useEffect(() => {
        const fetchNextPaymentNumber = async () => {
            try {
                const nextNumber = await fetchNextPaymentNumberFromAPI();
                setNextPaymentNumber(nextNumber);
            } catch (err) {
                console.error("Failed to fetch next payment number:", err);
                const year = moment().format('YYYY');
                const defaultNumber = `PAY-P${year}${String(0 + 1).padStart(5, '0')}`;
                setNextPaymentNumber(defaultNumber);
            }
        };

        fetchNextPaymentNumber();
    }, []);

    useEffect(() => {
        if (articleSearch.length >= 3) {
            const filtered = articles.filter(article =>
                article.nom.toLowerCase().includes(articleSearch.toLowerCase()) ||
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
            const [facturesData, fournisseursData, articlesData, paymentsData] = await Promise.all([
                fetchFactures(),
                fetchFournisseurs(),
                fetchArticles(),
                fetchPayments()
            ]);
    
            const facturesWithCalculatedPayments = facturesData.map(facture => {
                const relevantPayments = paymentsData.filter(payment =>
                    payment.factureFournisseur && payment.factureFournisseur.id === facture.id
                );
    
                const totalPayments = relevantPayments.reduce((sum, payment) => {
                    let paymentAmount: number;
                    if (typeof payment.montant === 'string') {
                        paymentAmount = parseFloat(payment.montant) || 0;
                    } else {
                        paymentAmount = payment.montant || 0;
                    }
                    return sum + paymentAmount;
                }, 0);
    
                let status: "Brouillon" | "Validee" | "Payee" | "Annulee" | "Partiellement Payee" = facture.status;
                let subTotal = 0;
                let totalTax = 0;
                let grandTotal = 0;
    
                facture.articles.forEach(item => {
                    const qty = Number(item.quantite) || 1;
                    const price = Number(item.prixUnitaire) || 0;
                    const tvaRate = Number(item.tva ?? 0);
                    const remiseRate = Number(item.remise || 0);
    
                    const montantHTLigne = qty * price * (1 - (remiseRate / 100));
                    const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
                    const taxAmount = montantTTCLigne - montantHTLigne;
    
                    subTotal += montantHTLigne;
                    totalTax += taxAmount;
                    grandTotal += montantTTCLigne;
                });
    
                let finalTotal = grandTotal;
                const hasDiscount = facture.remise && Number(facture.remise) > 0;
                
                if (hasDiscount) {
                    if (facture.remiseType === "percentage") {
                        finalTotal = grandTotal * (1 - Number(facture.remise) / 100);
                    } else {
                        finalTotal = Number(facture.remise);
                    }
                }
                
                if (facture.timbreFiscal) {
                    if (hasDiscount) {
                        finalTotal += 1;
                    } else {
                        grandTotal += 1;
                        finalTotal = grandTotal;
                    }
                }
    
                let resteAPayer = finalTotal - totalPayments;
                
                // Fix floating point issues
                subTotal = Math.round(subTotal * 100) / 100;
                totalTax = Math.round(totalTax * 100) / 100;
                grandTotal = Math.round(grandTotal * 100) / 100;
                finalTotal = Math.round(finalTotal * 100) / 100;
                resteAPayer = Math.round(resteAPayer * 100) / 100;
                
                // Ensure no negative values
                resteAPayer = Math.max(0, resteAPayer);
    
                // Update status logic
                if (facture.status === "Annulee") {
                    status = "Annulee";
                } else if (resteAPayer === 0 && finalTotal > 0) {
                    status = "Payee";
                } else if (totalPayments > 0 && totalPayments < finalTotal) {
                    status = "Partiellement Payee";
                }
    
                return {
                    ...facture,
                    totalHT: subTotal,
                    totalTVA: totalTax,
                    totalTTC: grandTotal,
                    totalTTCAfterRemise: finalTotal,
                    montantPaye: totalPayments,
                    resteAPayer: resteAPayer,
                    status: status,
                    hasPayments: totalPayments > 0
                };
            });
    
            setFactures(facturesWithCalculatedPayments);
            setFilteredFactures(facturesWithCalculatedPayments);
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
        let result = [...factures];

        if (activeTab === "2") {
            result = result.filter(facture => facture.status === "Brouillon");
        } else if (activeTab === "3") {
            result = result.filter(facture => facture.status === "Validee");
        } else if (activeTab === "4") {
            result = result.filter(facture => facture.status === "Payee");
        } else if (activeTab === "5") {
            result = result.filter(facture => facture.status === "Annulee");
        }

        if (startDate && endDate) {
            const start = moment(startDate).startOf('day');
            const end = moment(endDate).endOf('day');
            result = result.filter(facture => {
                const factureDate = moment(facture.dateFacture);
                return factureDate.isBetween(start, end, null, '[]');
            });
        }

        if (searchText) {
            const searchLower = searchText.toLowerCase();
            result = result.filter(facture =>
                facture.numeroFacture.toLowerCase().includes(searchLower) ||
                (facture.fournisseur?.raison_sociale && facture.fournisseur.raison_sociale.toLowerCase().includes(searchLower))
            );
        }

        setFilteredFactures(result);
    }, [activeTab, startDate, endDate, searchText, factures]);

    const { subTotal, totalTax, grandTotal, finalTotal } = useMemo(() => {
        if (selectedArticles.length === 0) {
            return {
                subTotal: "0",
                totalTax: "0",
                grandTotal: "0",
                finalTotal: "0"
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
    
        let finalTotalValue = grandTotalValue;
        
        // Apply global discount if any
        if (showRemise && Number(globalRemise) > 0) {
            if (remiseType === "percentage") {
                finalTotalValue = grandTotalValue * (1 - (Number(globalRemise) / 100));
            } else {
                finalTotalValue = Number(globalRemise);
            }
        }
        
        // Add timbre fiscal to the appropriate total
        if (timbreFiscal) {
            if (showRemise && globalRemise > 0) {
                // If there's a discount, add timbre to final total (after discount)
                finalTotalValue += 1;
            } else {
                // If no discount, add timbre to grand total
                grandTotalValue += 1;
                finalTotalValue = grandTotalValue; // Update final total to include timbre
            }
        }
    
        return {
            subTotal: subTotalValue.toFixed(2),
            totalTax: totalTaxValue.toFixed(2),
            grandTotal: grandTotalValue.toFixed(2),
            finalTotal: finalTotalValue.toFixed(2)
        };
    }, [selectedArticles, showRemise, globalRemise, remiseType, timbreFiscal]);

    const handleAddArticle = (articleId: string) => {
        const article = articles.find(a => a.id === parseInt(articleId));
        if (article && !selectedArticles.some(item => item.article_id === article.id)) {
            setSelectedArticles([...selectedArticles, {
                article_id: article.id,
                quantite: 0,
                prixUnitaire: article.pua_ht || 0,
                tva: article.tva ?? null,
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

    const toggleCreateEditModal = useCallback(() => {
        if (createEditModal) {
            setCreateEditModal(false);
            setFacture(null);
            setSelectedArticles([]);
            setGlobalRemise(0);
            setRemiseType("percentage");
            setShowRemise(false);
            setTimbreFiscal(false);
            setSelectedFournisseur(null);
            validation.resetForm();
        } else {
            setCreateEditModal(true);
        }
    }, [createEditModal]);

    const handleSubmit = async (values: any) => {
        try {
            const factureData = {
                ...values,
                taxMode,
                fournisseur_id: selectedFournisseur?.id,
                remise: globalRemise,
                remiseType: remiseType,
                articles: selectedArticles.map(item => ({
                    article_id: item.article_id,
                    quantite: item.quantite,
                    prix_unitaire: item.prixUnitaire,
                    tva: item.tva,
                    remise: item.remise
                })),
                totalHT: subTotal,
                totalTVA: totalTax,
                totalTTC: Number(grandTotal),
                timbreFiscal: timbreFiscal
            };

            if (isEdit && facture) {
                await updateFacture(facture.id, factureData);
                toast.success("Facture mise à jour avec succès");
            } else {
                await createFacture(factureData);
                toast.success("Facture créée avec succès");
            }

            setCreateEditModal(false);
            fetchData();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de l'opération");
        }
    };

    const validation = useFormik({
        enableReinitialize: true,
        initialValues: {
            numeroFacture: isEdit ? (facture?.numeroFacture || "") : nextFactureNumber,
            dateFacture: facture?.dateFacture ? moment(facture.dateFacture).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
            status: facture?.status ?? "Brouillon",
            notes: facture?.notes ?? "",
            fournisseur_id: facture?.fournisseur?.id ?? "",
            modeReglement: facture?.modeReglement ?? "Espece",
            dateEcheance: facture?.dateEcheance ? moment(facture.dateEcheance).format("YYYY-MM-DD") : "",
            montantPaye: facture?.montantPaye ?? 0,
            conditionPaiement: facture?.conditionPaiement ?? ""
        },
        validationSchema: Yup.object().shape({
            numeroFacture: Yup.string().required("Le numéro est requis"),
            dateFacture: Yup.date().required("La date est requise"),
            status: Yup.string().required("Le statut est requis"),
            fournisseur_id: Yup.number().required("Le fournisseur est requis"),
            modeReglement: Yup.string().required("Le mode de règlement est requis"),
            dateEcheance: Yup.date().nullable(),
            montantPaye: Yup.number().min(0, "Le montant payé ne peut pas être négatif"),
            conditionPaiement: Yup.string().nullable()
        }),
        onSubmit: handleSubmit
    });

    const openDetailModal = (facture: FactureFournisseur) => {
        setSelectedFacture(facture);
        setDetailModal(true);
    };

    const openPaymentModal = async (facture: FactureFournisseur) => {
        setSelectedFacture(facture);
        setPaymentModal(true);
    
        try {
            const nextNumber = await fetchNextPaymentNumberFromAPI();
            setNextPaymentNumber(nextNumber);
            
            // Reset form with current values
            setTimeout(() => {
                const initialMontant = facture.resteAPayer.toFixed(2).replace('.', ',');
                paymentValidation.setValues({
                    montant: initialMontant,
                    modePaiement: "Espece",
                    numeroPaiement: nextNumber,
                    date: moment().format("YYYY-MM-DD")
                });
            }, 100);
        } catch (err) {
            console.error("Failed to fetch next payment number:", err);
            setTimeout(() => {
                const initialMontant = facture.resteAPayer.toFixed(2).replace('.', ',');
                paymentValidation.setValues({
                    montant: initialMontant,
                    modePaiement: "Espece",
                    numeroPaiement: nextPaymentNumber,
                    date: moment().format("YYYY-MM-DD")
                });
            }, 100);
        }
    };

    const handleDelete = async () => {
        if (!facture) return;

        try {
            await deleteFacture(facture.id);
            setDeleteModal(false);
            fetchData();
            toast.success("Facture supprimée avec succès");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de la suppression");
        }
    };

    const handleAnnuler = async (factureId: number) => {
        try {
            await updateFacture(factureId, { status: "Annulee" });
            fetchData();
            toast.success("Facture annulée avec succès");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de l'annulation");
        }
    };

     

    const handlePaymentSubmit = async (values: any) => {
        if (!selectedFacture) return;
    
        if (selectedFacture.status === "Payee" || selectedFacture.status === "Annulee") {
            toast.error("Impossible d'ajouter un paiement pour une facture payée ou annulée.");
            return;
        }
    
        // values.montant is now already converted to number in the onSubmit
        const paymentAmount = values.montant;
        
        // Fix floating point comparison
        const roundedAmount = Math.round(paymentAmount * 100) / 100;
        const roundedReste = Math.round(selectedFacture.resteAPayer * 100) / 100;
        
        if (roundedAmount > roundedReste) {
            toast.error("Le montant du paiement ne peut pas dépasser le reste à payer.");
            return;
        }
    
        try {
            const paymentData = {
                facture_id: selectedFacture.id,
                montant: paymentAmount,
                modePaiement: values.modePaiement,
                numeroPaiement: values.numeroPaiement,
                date: values.date,
            };
    
            await createPayment(paymentData);
            setPaymentModal(false);
            fetchData();
            toast.success("Paiement enregistré avec succès");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de l'enregistrement du paiement");
        }
    };
    
    const paymentValidation = useFormik({
        enableReinitialize: true,
        initialValues: {
            montant: "0,00",
            modePaiement: "Espece",
            numeroPaiement: nextPaymentNumber,
            date: moment().format("YYYY-MM-DD")
        },
        validationSchema: Yup.object({
            montant: Yup.string()
                .test('is-valid-amount', "Le montant doit être un nombre valide", function (value) {
                    if (!value) return false;
                    
                    // Replace comma with dot for validation
                    const numericValue = parseFloat(value.replace(',', '.'));
                    return !isNaN(numericValue) && numericValue > 0;
                })
                .test('min-amount', "Le montant doit être supérieur à 0", function (value) {
                    if (!value) return false;
                    const numericValue = parseFloat(value.replace(',', '.'));
                    return numericValue >= 0.01;
                })
                .test('max-reste', "Le montant ne peut pas dépasser le reste à payer", function (value) {
                    if (!value) return false;
                    const numericValue = parseFloat(value.replace(',', '.'));
                    const reste = selectedFacture?.resteAPayer || 0;
                    
                    // Round both values to 2 decimal places for precise comparison
                    const roundedValue = Math.round(numericValue * 100) / 100;
                    const roundedReste = Math.round(reste * 100) / 100;
                    
                    return roundedValue <= roundedReste;
                })
                .required("Le montant est requis"),
            modePaiement: Yup.string().required("Le mode de paiement est requis"),
            numeroPaiement: Yup.string().required("Le numéro de paiement est requis"),
            date: Yup.date().required("La date est requise")
        }),
        onSubmit: (values) => {
            // Convert string to number before submitting
            const numericMontant = parseFloat(values.montant.replace(',', '.'));
            handlePaymentSubmit({
                ...values,
                montant: numericMontant
            });
        }
    });
    
    // Custom handler for montant field
    const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Allow only numbers, one comma, or one dot
        if (value === '' || /^[0-9]*[,.]?[0-9]*$/.test(value)) {
            // Replace dot with comma for consistent display
            value = value.replace('.', ',');
            
            // Allow only one comma
            const commaCount = (value.match(/,/g) || []).length;
            if (commaCount <= 1) {
                paymentValidation.setFieldValue('montant', value);
            }
        }
    };
    
    const handleMontantBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        if (value) {
            // Ensure comma as decimal separator
            value = value.replace('.', ',');
            
            // Format to 2 decimal places
            const parts = value.split(',');
            if (parts.length === 1) {
                // No decimal part
                value = value + ',00';
            } else if (parts.length === 2) {
                // Has decimal part
                const integerPart = parts[0] || '0';
                let decimalPart = parts[1];
                
                // Ensure exactly 2 decimal digits
                if (decimalPart.length === 0) {
                    decimalPart = '00';
                } else if (decimalPart.length === 1) {
                    decimalPart = decimalPart + '0';
                } else if (decimalPart.length > 2) {
                    decimalPart = decimalPart.substring(0, 2);
                }
                
                value = integerPart + ',' + decimalPart;
            }
            
            paymentValidation.setFieldValue('montant', value);
        }
    };

    const StatusBadge = ({ status }: { status?: "Brouillon" | "Validee" | "Payee" | "Annulee" | "Partiellement Payee" }) => {
        const statusConfig = {
            "Brouillon": { bgClass: "bg-warning", textClass: "text-warning", icon: "ri-time-line" },
            "Validee": { bgClass: "bg-primary", textClass: "text-primary", icon: "ri-checkbox-circle-line" },
            "Payee": { bgClass: "bg-success", textClass: "text-success", icon: "ri-money-dollar-circle-line" },
            "Annulee": { bgClass: "bg-danger", textClass: "text-danger", icon: "ri-close-circle-line" },
            "Partiellement Payee": { bgClass: "bg-info", textClass: "text-info", icon: "ri-wallet-line" }
        };
    
        const config = status && status in statusConfig ? statusConfig[status] : statusConfig["Brouillon"];
    
        return (
            <span className={`badge ${config.bgClass}-subtle ${config.textClass} text-uppercase`}>
                <i className={`${config.icon} align-bottom me-1`}></i>
                {status || "Brouillon"}
            </span>
        );
    };

    const columns = useMemo(
        () => [
            {
                header: "Numéro",
                accessorKey: "numeroFacture",
                enableColumnFilter: false,
                cell: (cell: any) => (
                    <Link to="#" className="text-body fw-medium" onClick={() => openDetailModal(cell.row.original)}>
                        {cell.getValue()}
                    </Link>
                ),
            },
            {
                header: "Date Facture",
                accessorKey: "dateFacture",
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
                header: "Total TTC",
                accessorKey: "totalTTC",
                enableColumnFilter: false,
                cell: (cell: any) => {
                    const total = Number(cell.getValue()) || 0;
                    return `${total.toFixed(2)} DT`;
                },
            },
            {
                header: "Total TTC Après Remise",
                accessorKey: "totalTTCAfterRemise", // Use the calculated field
                enableColumnFilter: false,
                cell: (cell: any) => {
                    const total = Number(cell.getValue()) || 0;
                    return `${total.toFixed(2)} DT`;
                },
            },
            {
                header: "Payé",
                accessorKey: "montantPaye",
                enableColumnFilter: false,
                cell: (cell: any) => `${Number(cell.getValue()).toFixed(2)} DT`,
            },
            {
                header: "Reste à payer",
                accessorKey: "resteAPayer",
                enableColumnFilter: false,
                cell: (cell: any) => {
                    const value = Number(cell.getValue());
                    const displayValue = Math.abs(value).toFixed(2);
                    return `${displayValue} DT`;
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
                    const facture = cellProps.row.original;
                    const hasPayments = facture.montantPaye > 0;
                    
                    return (
                        <ul className="list-inline hstack gap-2 mb-0">
                            {/* View Detail - Always visible */}
                            <li className="list-inline-item">
                                <Link to="#" className="text-info d-inline-block" onClick={() => openDetailModal(facture)}>
                                    <i className="ri-eye-line fs-16"></i>
                                </Link>
                            </li>
                            
                            {/* PDF - Always visible */}
                            <li className="list-inline-item">
                                <Link to="#" className="text-info d-inline-block" onClick={() => openPdfModal(facture)}>
                                    <i className="ri-file-pdf-line fs-16"></i>
                                </Link>
                            </li>
                            
                            {/* Edit - Only show if no payments and not cancelled */}
                           
                            {!hasPayments && facture.status !== "Annulee" && (
                                <li className="list-inline-item edit">
                                    <Link to="#" className="text-primary d-inline-block edit-item-btn" onClick={() => {
                                        setFacture(facture);
                                        setSelectedFournisseur(facture.fournisseur);
                                        setSelectedArticles(facture.articles.map((item: FactureFournisseur['articles'][number]) => ({
                                            article_id: item.article.id,
                                            quantite: item.quantite,
                                            prixUnitaire: Number(item.prixUnitaire),
                                            tva: item.tva != null ? Number(item.tva) : null,
                                            remise: item.remise != null ? Number(item.remise) : null,
                                            articleDetails: item.article
                                        })));
                                        setGlobalRemise(facture.remise || 0);
                                        setRemiseType(facture.remiseType || "percentage");
                                        setShowRemise(!!facture.remise && facture.remise > 0);
                                        setTimbreFiscal(facture.timbreFiscal || false);
                                        setIsEdit(true);
                                        setCreateEditModal(true);
                                    }}>
                                        <i className="ri-pencil-fill fs-16"></i>
                                    </Link>
                                </li>
                            )}
                            
                            {/* Add Payment - Only show if not cancelled and has remaining amount */}
                            {facture.status !== "Annulee" && facture.resteAPayer > 0 && (
                                <li className="list-inline-item">
                                    <Link to="#" className="text-success d-inline-block" onClick={() => openPaymentModal(facture)}>
                                        <i className="ri-money-dollar-circle-line fs-16"></i>
                                    </Link>
                                </li>
                            )}
                            
                            {/* Delete - Only show if no payments and not cancelled */}
                            {!hasPayments && facture.status !== "Annulee" && (
                                <li className="list-inline-item">
                                    <Link to="#" className="text-danger d-inline-block" onClick={() => {
                                        setFacture(facture);
                                        setDeleteModal(true);
                                    }}>
                                        <i className="ri-delete-bin-5-fill fs-16"></i>
                                    </Link>
                                </li>
                            )}
                            
                            {/* Cancel :  {facture.status !== "Annulee" && facture.status !== "Payee" && (
                                <li className="list-inline-item">
                                    <Link to="#" className="text-danger d-inline-block" onClick={() => handleAnnuler(facture.id)}>
                                        <i className="ri-close-circle-line fs-16"></i>
                                    </Link>
                                </li>
                            )}*/}
                      
                        </ul>
                    );
                },
            },
        ],
        []
    );

    return (
        <div className="page-content">
            <DeleteModal show={deleteModal} onDeleteClick={handleDelete} onCloseClick={() => setDeleteModal(false)} />
            <Container fluid>
                <BreadCrumb title="Factures Fournisseurs" pageTitle="Factures" />
                <Row>
                    <Col lg={12}>
                        <Card id="factureList">
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="card-title mb-0">Gestion des Factures Fournisseurs</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <Button color="secondary" onClick={() => {
                                            setIsEdit(false);
                                            setFacture(null);
                                            setSelectedArticles([]);
                                            setSelectedFournisseur(null);
                                            setGlobalRemise(0);
                                            setRemiseType("percentage");
                                            setShowRemise(false);
                                            setTimbreFiscal(false);
                                            validation.resetForm();
                                            setCreateEditModal(true);
                                        }}>
                                            <i className="ri-add-line align-bottom me-1"></i> Ajouter Facture
                                        </Button>
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
                                        <i className="ri-checkbox-circle-line me-1 align-bottom"></i> Validée
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === "4" })} onClick={() => setActiveTab("4")}>
                                        <i className="ri-money-dollar-circle-line me-1 align-bottom"></i> Payée
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: activeTab === "5" })} onClick={() => setActiveTab("5")}>
                                        <i className="ri-close-circle-line me-1 align-bottom"></i> Annulée
                                    </NavLink>
                                </NavItem>
                            </Nav>
                            <CardBody className="pt-3">
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <div className="search-box">
                                            <Input type="text" className="form-control" placeholder="Rechercher..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                                            <i className="ri-search-line search-icon"></i>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <InputGroup>
                                            <InputGroupText>De</InputGroupText>
                                            <Flatpickr className="form-control" options={{ dateFormat: "d M, Y", altInput: true, altFormat: "F j, Y" }} placeholder="Date de début" onChange={(dates) => setStartDate(dates[0])} />
                                        </InputGroup>
                                    </Col>
                                    <Col md={3}>
                                        <InputGroup>
                                            <InputGroupText>À</InputGroupText>
                                            <Flatpickr className="form-control" options={{ dateFormat: "d M, Y", altInput: true, altFormat: "F j, Y" }} placeholder="Date de fin" onChange={(dates) => setEndDate(dates[0])} />
                                        </InputGroup>
                                    </Col>
                                    <Col md={2}>
                                        <Button color="light" className="w-100" onClick={() => { setStartDate(null); setEndDate(null); setSearchText(""); }}>
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
                                        data={filteredFactures}
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
                                                <h5 className="mb-1">Facture #{selectedFacture?.numeroFacture}</h5>
                                                <div className="d-flex align-items-center">
                                                    <StatusBadge status={selectedFacture?.status} />
                                                    <small className="text-muted ms-2">{moment(selectedFacture?.dateFacture).format("DD MMM YYYY")}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </ModalHeader>
                                    <ModalBody className="pt-0">
                                        {selectedFacture && (
                                            <div className="facture-details">
                                                <Row className="g-3 mb-3">
                                                    <Col md={6}>
                                                        <Card className="border shadow-sm">
                                                            <CardBody className="p-3">
                                                                <h6 className="text-uppercase text-muted fs-12 mb-3">Fournisseur</h6>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="flex-grow-1">
                                                                        <h5 className="mb-1">{selectedFacture.fournisseur?.raison_sociale}</h5>
                                                                        <p className="text-muted mb-1 small">
                                                                            <i className="ri-map-pin-line me-1"></i>
                                                                            {selectedFacture.fournisseur?.adresse}, {selectedFacture.fournisseur?.ville}
                                                                        </p>
                                                                        <p className="text-muted mb-0 small">
                                                                            <i className="ri-file-text-line me-1"></i>
                                                                            MF: {selectedFacture.fournisseur?.matricule_fiscal}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Card className="border shadow-sm">
                                                            <CardBody className="p-3">
                                                                <h6 className="text-uppercase text-muted fs-12 mb-3">Informations</h6>
                                                                <div className="row g-2">
                                                                    <div className="col-6">
                                                                        <p className="mb-1 small"><span className="text-muted">Créé le:</span><br />{moment(selectedFacture.createdAt).format("DD/MM/YYYY")}</p>
                                                                    </div>
                                                                    <div className="col-6">
                                                                        <p className="mb-1 small"><span className="text-muted">Mode règlement:</span><br />{selectedFacture.modeReglement || 'Non spécifié'}</p>
                                                                    </div>
                                                                    <div className="col-6">
                                                                        <p className="mb-1 small"><span className="text-muted">Échéance:</span><br />{selectedFacture.dateEcheance ? moment(selectedFacture.dateEcheance).format("DD/MM/YYYY") : 'Non spécifiée'}</p>
                                                                    </div>
                                                                    <div className="col-6">
                                                                        <p className="mb-1 small"><span className="text-muted">Statut:</span><br /><StatusBadge status={selectedFacture.status} /></p>
                                                                    </div>
                                                                    {selectedFacture.conditionPaiement && (
                                                                        <div className="col-6">
                                                                            <p className="mb-1 small"><span className="text-muted">Condition de paiement:</span><br />{selectedFacture.conditionPaiement} jours</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                                {selectedFacture.notes && (
                                                    <Card className="border shadow-sm mb-3">
                                                        <CardBody className="p-3">
                                                            <h6 className="text-uppercase text-muted fs-12 mb-2">Notes</h6>
                                                            <p className="mb-0">{selectedFacture.notes}</p>
                                                        </CardBody>
                                                    </Card>
                                                )}
                                                <Card className="border shadow-sm">
                                                    <CardBody className="p-0">
                                                        <div className="table-responsive">
                                                            <Table className="table table-bordered mb-0">
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
                                                                    {selectedFacture.articles.map((item, index) => {
                                                                        const montantHTLigne = Number(item.quantite) * Number(item.prixUnitaire) * (1 - (Number(item.remise || 0) / 100));
                                                                        const montantTTCLigne = montantHTLigne * (1 + (Number(item.tva || 0) / 100));
                                                                        return (
                                                                            <tr key={index} className={index % 2 === 0 ? "table-light" : ""}>
                                                                                <td className="ps-3">
                                                                                    <div className="d-flex align-items-center">
                                                                                        <div className="flex-grow-1">
                                                                                            <h6 className="mb-0 fs-14">{item.article?.designation}</h6>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td><span className="text-muted">{item.article?.reference || '-'}</span></td>
                                                                                <td className="text-end">{Number(item.quantite)}</td>
                                                                                <td className="text-end">{Number(item.prixUnitaire).toFixed(2)}</td>
                                                                                <td className="text-end">{Number(item.tva || 0).toFixed(0)}%</td>
                                                                                <td className="text-end">{Number(item.remise || 0).toFixed(0)}%</td>
                                                                                <td className="text-end">{montantHTLigne.toFixed(2)} DT</td>
                                                                                <td className="text-end pe-3 fw-medium">{montantTTCLigne.toFixed(2)} DT</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                        <div className="border-top p-3 bg-light">
                                                            <Row className="justify-content-end">
                                                                <Col xs={12} sm={8} md={6} lg={5}>
                                                                    <Table className="table table-bordered table-sm mb-0">
                                                                        <tbody>
                                                                            <tr>
                                                                                <th className="text-end text-muted">Sous-total HT:</th>
                                                                                <td className="text-end">{selectedFacture.totalHT.toFixed(2)} DT</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th className="text-end text-muted">TVA:</th>
                                                                                <td className="text-end">{selectedFacture.totalTVA.toFixed(2)} DT</td>
                                                                            </tr>
                                                                            {selectedFacture.timbreFiscal && (
    <tr>
        <th className="text-end text-muted">Timbre Fiscal:</th>
        <td className="text-end">1.00 DT</td>
    </tr>
)}
<tr>
    <th className="text-end text-muted">Total TTC:</th>
    <td className="text-end fw-medium">
        {(selectedFacture.totalTTC + (selectedFacture.timbreFiscal && !selectedFacture.remise ? 1 : 0)).toFixed(2)} DT
    </td>
</tr>
{selectedFacture.remise > 0 && (
    <tr className="table-primary">
        <th className="text-end text-muted">Total TTC Après Remise:</th>
        <td className="text-end fw-bold">
            {((selectedFacture.remiseType === "percentage" 
                ? selectedFacture.totalTTC * (1 - selectedFacture.remise / 100) 
                : Number(selectedFacture.remise)) + (selectedFacture.timbreFiscal ? 1 : 0)).toFixed(2)} DT
        </td>
    </tr>
)}
                                                                            <tr>
                                                                                <th className="text-end text-muted">Montant payé:</th>
                                                                                <td className="text-end">{Number(selectedFacture.montantPaye).toFixed(2)} DT</td>
                                                                            </tr>
                                                                            <tr className={Number(selectedFacture.resteAPayer) > 0 ? "table-warning" : "table-success"}>
                                                                                <th className="text-end text-muted">Reste à payer:</th>
                                                                                <td className="text-end fw-bold">{Number(selectedFacture.resteAPayer).toFixed(2)} DT</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            </div>
                                        )}
                                    </ModalBody>
                                    <ModalFooter>
                                        {selectedFacture && selectedFacture.resteAPayer > 0 && selectedFacture.status !== "Annulee" && selectedFacture.status !== "Payee" && (
                                            <Button color="success" size="md" onClick={() => openPaymentModal(selectedFacture)}>
                                                <i className="ri-money-dollar-circle-line me-1"></i> Ajouter Paiement
                                            </Button>
                                        )}
                                        {selectedFacture && (
                                            <Button color="primary" size="md" onClick={() => openPdfModal(selectedFacture)} className="me-2">
                                                <i className="ri-file-pdf-line me-1"></i> Imprimer PDF
                                            </Button>
                                        )}
                                        <Button color="secondary" onClick={() => setDetailModal(false)}>Fermer</Button>
                                    </ModalFooter>
                                </Modal>
                                <Modal isOpen={createEditModal} toggle={toggleCreateEditModal} centered size="lg">
                                    <ModalHeader toggle={toggleCreateEditModal}>{isEdit ? "Modifier Facture" : "Créer Facture"}</ModalHeader>
                                    <Form onSubmit={validation.handleSubmit}>
                                        <ModalBody style={{ padding: '20px' }}>
                                            <Row>
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>Numéro de Facture*</Label>
                                                        <Input name="numeroFacture" value={validation.values.numeroFacture} onChange={validation.handleChange} onBlur={validation.handleBlur} invalid={validation.touched.numeroFacture && !!validation.errors.numeroFacture} readOnly={isEdit} />
                                                        <FormFeedback>{validation.errors.numeroFacture}</FormFeedback>
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>Date de Facture*</Label>
                                                        <Input type="date" name="dateFacture" value={validation.values.dateFacture} onChange={validation.handleChange} onBlur={validation.handleBlur} invalid={validation.touched.dateFacture && !!validation.errors.dateFacture} />
                                                    </div>
                                                </Col>
                                                <Col md={4}>
                                                    <div className="mb-3">
                                                        <Label>Date d'Échéance</Label>
                                                        <Input type="date" name="dateEcheance" value={validation.values.dateEcheance} onChange={validation.handleChange} onBlur={validation.handleBlur} invalid={validation.touched.dateEcheance && !!validation.errors.dateEcheance} />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <Label>Fournisseur*</Label>
                                                        <Input type="text" placeholder="Rechercher fournisseur (min 3 caractères)" value={selectedFournisseur ? selectedFournisseur.raison_sociale : fournisseurSearch} onChange={(e) => {
                                                            if (!e.target.value) {
                                                                setSelectedFournisseur(null);
                                                                validation.setFieldValue("fournisseur_id", "");
                                                            }
                                                            setFournisseurSearch(e.target.value);
                                                        }} readOnly={!!selectedFournisseur} />
                                                        {!selectedFournisseur && fournisseurSearch.length >= 3 && (
                                                            <div className="search-results mt-2">
                                                                {filteredFournisseurs.length > 0 ? (
                                                                    <ul className="list-group">
                                                                        {filteredFournisseurs.map(f => (
                                                                            <li key={f.id} className="list-group-item list-group-item-action" onClick={() => {
                                                                                setSelectedFournisseur(f);
                                                                                validation.setFieldValue("fournisseur_id", f.id);
                                                                                setFournisseurSearch("");
                                                                                setFilteredFournisseurs([]);
                                                                            }}>{f.raison_sociale}</li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <div className="text-muted">Aucun résultat trouvé</div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {selectedFournisseur && (
                                                            <Button color="link" size="sm" className="mt-1 p-0" onClick={() => {
                                                                setSelectedFournisseur(null);
                                                                validation.setFieldValue("fournisseur_id", "");
                                                                setFournisseurSearch("");
                                                            }}>
                                                                <i className="ri-close-line"></i> Changer de fournisseur
                                                            </Button>
                                                        )}
                                                        {validation.touched.fournisseur_id && validation.errors.fournisseur_id && (
                                                            <div className="text-danger">{validation.errors.fournisseur_id}</div>
                                                        )}
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-3">
                                                        <Label>Condition de paiement</Label>
                                                        <Input type="text" name="conditionPaiement" placeholder="Ex: 7 jours" value={validation.values.conditionPaiement || ""} onChange={validation.handleChange} onBlur={validation.handleBlur} />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={12}>
                                                    <div className="mb-3">
                                                        <Label>Notes</Label>
                                                        <Input type="textarea" name="notes" value={validation.values.notes} onChange={validation.handleChange} />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={3}>
                                                    <FormGroup check>
                                                        <Input type="checkbox" id="timbreFiscal" checked={timbreFiscal} onChange={(e) => setTimbreFiscal(e.target.checked)} />
                                                        <Label for="timbreFiscal" check>Timbre Fiscal (1 DT)</Label>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            <Row className="mt-3">
                                                <Col md={12}>
                                                    <h5>Articles</h5>
                                                    <div className="mb-3">
                                                        <Input type="text" placeholder="Rechercher article (min 3 caractères)" value={articleSearch} onChange={(e) => setArticleSearch(e.target.value)} />
                                                        {articleSearch.length >= 3 && (
                                                            <div className="search-results mt-2">
                                                                {filteredArticles.length > 0 ? (
                                                                    <ul className="list-group">
                                                                        {filteredArticles.map(article => (
                                                                            <li key={article.id} className="list-group-item list-group-item-action" onClick={() => {
                                                                                handleAddArticle(article.id.toString());
                                                                                setArticleSearch("");
                                                                                setFilteredArticles([]);
                                                                            }}>{article.reference} - {article.nom} (Stock: {article.qte})</li>
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
                                                                <Input type="checkbox" id="showRemise" checked={showRemise} onChange={(e) => {
                                                                    setShowRemise(e.target.checked);
                                                                    if (!e.target.checked) {
                                                                        setGlobalRemise(0);
                                                                    }
                                                                }} />
                                                                <Label for="showRemise" check>Appliquer une remise</Label>
                                                            </FormGroup>
                                                        </Col>
                                                        {showRemise && (
                                                            <>
                                                                <Col md={3}>
                                                                    <div className="mb-3">
                                                                        <Label>Type de remise</Label>
                                                                        <Input type="select" value={remiseType} onChange={(e) => setRemiseType(e.target.value as "percentage" | "fixed")}>
                                                                            <option value="percentage">Pourcentage</option>
                                                                            <option value="fixed">Montant fixe</option>
                                                                        </Input>
                                                                    </div>
                                                                </Col>
                                                                <Col md={3}>
                                                                    <div className="mb-3">
                                                                        <Label>{remiseType === "percentage" ? "Pourcentage de remise" : "Montant de remise (DT)"}</Label>
                                                                        <Input type="number" min="0" value={globalRemise} onChange={(e) => setGlobalRemise(Number(e.target.value) || 0)} placeholder={remiseType === "percentage" ? "0-100%" : "Montant en DT"} />
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
                                                                                <Input type="number" min="1" value={item.quantite} onChange={(e) => handleArticleChange(item.article_id, 'quantite', Number(e.target.value))} />
                                                                            </td>
                                                                            <td width="120px">
                                                                                <Input type="number" min="0" step="0.01" value={item.prixUnitaire} onChange={(e) => handleArticleChange(item.article_id, 'prixUnitaire', Number(e.target.value))} />
                                                                            </td>
                                                                            <td width="100px">
                                                                                <Input type="select" value={item.tva ?? ''} onChange={(e) => handleArticleChange(item.article_id, 'tva', e.target.value === '' ? null : Number(e.target.value))}>
                                                                                    <option value="">Sélectionner TVA</option>
                                                                                    {tvaOptions.map(option => (
                                                                                        <option key={option.value ?? 'null'} value={option.value ?? ''}>{option.label}</option>
                                                                                    ))}
                                                                                </Input>
                                                                            </td>
                                                                            <td width="100px">
                                                                                <Input type="number" min="0" max="100" value={item.remise ?? 0} onChange={(e) => handleArticleChange(item.article_id, 'remise', Number(e.target.value))} />
                                                                            </td>
                                                                            <td>{montantHTLigne.toFixed(2)} DT</td>
                                                                            <td>{montantTTCLigne.toFixed(2)} DT</td>
                                                                            <td>
                                                                                <Button color="danger" size="sm" onClick={() => handleRemoveArticle(item.article_id)}>
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
                                                        <Col xs={12} sm={8} md={6} lg={5}>
                                                        <Table className="table table-bordered table-sm mb-0">
    <tbody>
        <tr>
            <th className="text-end text-muted">Sous-total HT:</th>
            <td className="text-end">{subTotal} DT</td>
        </tr>
        <tr>
            <th className="text-end text-muted">TVA:</th>
            <td className="text-end">{totalTax} DT</td>
        </tr>
        {timbreFiscal && !(showRemise && globalRemise > 0) && (
            <tr>
                <th className="text-end text-muted">Timbre Fiscal:</th>
                <td className="text-end">1.00 DT</td>
            </tr>
        )}
        <tr>
            <th className="text-end text-muted">Total TTC:</th>
            <td className="text-end fw-medium">{grandTotal} DT</td>
        </tr>
        {showRemise && globalRemise > 0 && (
            <tr>
                <th className="text-end text-muted">
                    {remiseType === "percentage" ? `Remise (${globalRemise}%)` : "Remise (Montant fixe)"}
                </th>
                <td className="text-end text-danger">
                    - {remiseType === "percentage" 
                        ? (Number(grandTotal) * (globalRemise / 100)).toFixed(2)
                        : (Number(grandTotal) - Number(globalRemise)).toFixed(2)} DT
                </td>
            </tr>
        )}
        {showRemise && globalRemise > 0 && (
            <>
                {timbreFiscal && (
                    <tr>
                        <th className="text-end text-muted">Timbre Fiscal:</th>
                        <td className="text-end">1.00 DT</td>
                    </tr>
                )}
                <tr className="table-primary">
                    <th className="text-end text-muted">Total TTC Après Remise:</th>
                    <td className="text-end fw-bold">{finalTotal} DT</td>
                </tr>
            </>
        )}
    </tbody>
</Table>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="light" onClick={toggleCreateEditModal}>
                                                <i className="ri-close-line align-bottom me-1"></i> Annuler
                                            </Button>
                                            <Button color="primary" type="submit" disabled={selectedArticles.length === 0 || !selectedFournisseur}>
                                                <i className="ri-save-line align-bottom me-1"></i> {isEdit ? "Modifier" : "Enregistrer"}
                                            </Button>
                                        </ModalFooter>
                                    </Form>
                                </Modal>
                                <Modal isOpen={paymentModal} toggle={() => setPaymentModal(false)} centered>
    <ModalHeader toggle={() => setPaymentModal(false)}>Ajouter Paiement - Facture #{selectedFacture?.numeroFacture}</ModalHeader>
    <Form onSubmit={paymentValidation.handleSubmit}>
        <ModalBody style={{ padding: '20px' }}>
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <Label>Montant payé*</Label>
                        <Input
                            type="text"
                            name="montant"
                            value={paymentValidation.values.montant}
                            onChange={handleMontantChange}
                            onBlur={handleMontantBlur}
                            invalid={paymentValidation.touched.montant && !!paymentValidation.errors.montant}
                            placeholder="0,00"
                        />
                        <FormFeedback>{paymentValidation.errors.montant}</FormFeedback>
                        <small className="text-muted">
                            Reste à payer: {selectedFacture?.resteAPayer?.toFixed(2).replace('.', ',')} DT
                        </small>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="mb-3">
                        <Label>Mode de paiement*</Label>
                        <Input
                            type="select"
                            name="modePaiement"
                            value={paymentValidation.values.modePaiement}
                            onChange={paymentValidation.handleChange}
                            onBlur={paymentValidation.handleBlur}
                            invalid={paymentValidation.touched.modePaiement && !!paymentValidation.errors.modePaiement}
                        >
                            <option value="Espece">En espèces</option>
                            <option value="Cheque">Chèque</option>
                            <option value="Virement">Virement</option>
                            <option value="Traite">Traite</option>
                            <option value="Autre">Autre</option>
                        </Input>
                        <FormFeedback>{paymentValidation.errors.modePaiement}</FormFeedback>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <div className="mb-3">
                        <Label>Paiement n°*</Label>
                        <Input
                            type="text"
                            name="numeroPaiement"
                            value={paymentValidation.values.numeroPaiement}
                            onChange={paymentValidation.handleChange}
                            onBlur={paymentValidation.handleBlur}
                            invalid={paymentValidation.touched.numeroPaiement && !!paymentValidation.errors.numeroPaiement}
                        />
                        <FormFeedback>{paymentValidation.errors.numeroPaiement}</FormFeedback>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="mb-3">
                        <Label>Date*</Label>
                        <Input
                            type="date"
                            name="date"
                            value={paymentValidation.values.date}
                            onChange={paymentValidation.handleChange}
                            onBlur={paymentValidation.handleBlur}
                            invalid={paymentValidation.touched.date && !!paymentValidation.errors.date}
                        />
                    </div>
                </Col>
            </Row>
        </ModalBody>
        <ModalFooter>
            <Button color="light" onClick={() => setPaymentModal(false)}>
                <i className="ri-close-line align-bottom me-1"></i> Annuler
            </Button>
            <Button color="primary" type="submit">
                <i className="ri-save-line align-bottom me-1"></i> Enregistrer Paiement
            </Button>
        </ModalFooter>
    </Form>
</Modal>
                                <ToastContainer />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <FacturePDFModal isOpen={pdfModal} toggle={() => setPdfModal(false)} facture={selectedFactureForPdf} companyInfo={companyInfo} />
            </Container>
        </div>
    );
};

export default FactureList;