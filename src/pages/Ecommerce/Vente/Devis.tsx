import React, { Fragment, useEffect, useState, useMemo, useCallback } from "react";
import {
    Card, CardBody, Col, Container, CardHeader, Row, Modal, ModalHeader, Nav,
    NavItem, NavLink,
    Form, ModalBody, ModalFooter, Label, Input, FormFeedback, Badge, Table, Button, InputGroupText, InputGroup, FormGroup
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
    fetchDevis, createDevis, updateDevis, deleteDevis, createBonCommandeClientBasedOnDevis, fetchNextCommandeNumber
} from "../../../Components/CommandeClient/CommandeClientServices";
import { fetchArticles, fetchClients, fetchVendeurs } from "../../../Components/Article/ArticleServices";
import { Article, Client, Vendeur, BonCommandeClient } from "../../../Components/Article/Interfaces";
import classnames from "classnames";

const Devis = () => {
    const [detailModal, setDetailModal] = useState(false);
    const [selectedBonCommande, setSelectedBonCommande] = useState<BonCommandeClient | null>(null);
    const [taxMode, setTaxMode] = useState<"HT" | "TTC">("HT");
    const [activeTab, setActiveTab] = useState("1");
    const [modal, setModal] = useState(false);
    const [bonsCommande, setBonsCommande] = useState<BonCommandeClient[]>([]);
    const [filteredBonsCommande, setFilteredBonsCommande] = useState<BonCommandeClient[]>([]);
    const [bonCommande, setBonCommande] = useState<BonCommandeClient | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [searchText, setSearchText] = useState("");
    const [articleSearch, setArticleSearch] = useState("");
    const [clientSearch, setClientSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [showRemise, setShowRemise] = useState(false);
    const [selectedArticles, setSelectedArticles] = useState<{
      article_id: number;
      quantite: number | "";
      prixUnitaire: number;
      prixTTC: number; // Keep this
      tva?: number | null;
      remise?: number | null;
      articleDetails?: Article;
    }[]>([]);
    const [remiseType, setRemiseType] = useState<"percentage" | "fixed">("percentage");
    const [globalRemise, setGlobalRemise] = useState<number>(0);
    const [isCreatingCommande, setIsCreatingCommande] = useState(false);
    const [nextNumeroCommande, setNextNumeroCommande] = useState("");
    const [editingTTC, setEditingTTC] = useState<{ [key: number]: string }>({});
    const [editingHT, setEditingHT] = useState<{ [key: number]: string }>({});
    const tvaOptions = [
        { value: null, label: "Non applicable" },
        { value: 0, label: "0% (Exonéré)" },
        { value: 7, label: "7%" },
        { value: 10, label: "10%" },
        { value: 13, label: "13%" },
        { value: 19, label: "19%" },
        { value: 21, label: "21%" }
    ];

    const generateNextNumber = (
        bonsCommande: BonCommandeClient[],
        currentYear: string,
        type: 'devis' | 'bonCommande'
    ) => {
        const prefix = type === 'devis' ? 'DIVER' : 'BC';
        const regex = new RegExp(`^${prefix}-(\\d{4})/${currentYear}$`);

        // Filter bonsCommande based on prefix
        const relevantBons = bonsCommande.filter(bon =>
            bon.numeroCommande.startsWith(`${prefix}-`)
        );

        // Extract numbers from relevant entries for the current year
        const numbers = relevantBons
            .map(bon => {
                const match = bon.numeroCommande.match(regex);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter((num): num is number => num !== null);

        // Find the highest number and increment
        const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

        // Format as PREFIX-XXXX/YYYY (e.g., DIVER-0001/2025 or BC-0001/2025)
        return `${prefix}-${nextNumber.toString().padStart(4, '0')}/${currentYear}`;
    };

    const fetchNextCommandeNumberFromAPI = useCallback(async () => {
        try {
            const numero = await fetchNextCommandeNumber();
            setNextNumeroCommande(numero);
        } catch (err) {
            toast.error("Échec de la récupération du numéro de commande");
            setNextNumeroCommande(generateNextNumber(bonsCommande, moment().format('YYYY'), 'bonCommande'));
        }
    }, [bonsCommande]);

    useEffect(() => {
        if (modal && !isEdit && isCreatingCommande) {
            fetchNextCommandeNumberFromAPI();
        }
    }, [modal, isEdit, isCreatingCommande, fetchNextCommandeNumberFromAPI]);

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
        if (clientSearch.length >= 3) {
            const filtered = clients.filter(client =>
                client.raison_sociale.toLowerCase().includes(clientSearch.toLowerCase())
            );
            setFilteredClients(filtered);
        } else {
            setFilteredClients([]);
        }
    }, [clientSearch, clients]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [bonsData, clientsData, vendeursData, articlesData] = await Promise.all([
                fetchDevis(),
                fetchClients(),
                fetchVendeurs(),
                fetchArticles()
            ]);

            setBonsCommande(bonsData);
            setFilteredBonsCommande(bonsData);
            setClients(clientsData);
            setVendeurs(vendeursData);
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

        if (activeTab === "4") {
            result = result.filter(bon => bon.status === "Confirme");
        } else if (activeTab === "6") {
            result = result.filter(bon => bon.status === "Annule");
        }

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
                (bon.client?.raison_sociale && bon.client.raison_sociale.toLowerCase().includes(searchLower))
            );
        }

        setFilteredBonsCommande(result);
    }, [activeTab, startDate, endDate, searchText, bonsCommande]);

    const openDetailModal = (bonCommande: BonCommandeClient) => {
        setSelectedBonCommande(bonCommande);
        setDetailModal(true);
    };

// Add these helper functions
const parseNumericInput = (value: string): number => {
  if (!value || value === "") return 0;
  const cleanValue = value.replace(",", ".");
  const numericValue = parseFloat(cleanValue);
  return isNaN(numericValue) ? 0 : Math.round(numericValue * 1000) / 1000;
};

const formatForDisplay = (
  value: number | string | undefined | null
): string => {
  if (value === undefined || value === null) return "0,000";
  const numericValue =
    typeof value === "string" ? parseNumericInput(value) : Number(value);
  if (isNaN(numericValue)) return "0,000";
  return numericValue.toFixed(3).replace(".", ",");
}; 

// Replace the existing useMemo calculation with this
const { sousTotalHT, netHT, totalTax, grandTotal, finalTotal, discountAmount } = useMemo(() => {
  if (selectedArticles.length === 0) {
    return {
      sousTotalHT: 0,
      netHT: 0,
      totalTax: 0, 
      grandTotal: 0,
      finalTotal: 0,
      discountAmount: 0,
    };
  }

  let sousTotalHTValue = 0;
  let netHTValue = 0;
  let totalTaxValue = 0;
  let grandTotalValue = 0;

  // Calculate initial totals with proper rounding
  selectedArticles.forEach((article) => {
    const qty = article.quantite === "" ? 0 : Number(article.quantite) || 0;
    const tvaRate = Number(article.tva) || 0;
    const remiseRate = Number(article.remise) || 0;
    
    let priceHT = Number(article.prixUnitaire) || 0;
    let priceTTC = Number(article.prixTTC) || 0;
    
    if (editingHT[article.article_id] !== undefined) {
      const editingValue = parseNumericInput(editingHT[article.article_id]);
      if (!isNaN(editingValue) && editingValue >= 0) {
        priceHT = parseFloat(editingValue.toFixed(3));
        const tvaAmount = tvaRate > 0 ? parseFloat((priceHT * tvaRate / 100).toFixed(3)) : 0;
        priceTTC = parseFloat((priceHT + tvaAmount).toFixed(3));
      }
    } else if (editingTTC[article.article_id] !== undefined) {
      const editingValue = parseNumericInput(editingTTC[article.article_id]);
      if (!isNaN(editingValue) && editingValue >= 0) {
        priceTTC = parseFloat(editingValue.toFixed(3));
        if (tvaRate > 0) {
          const coefficient = 1 + (tvaRate / 100);
          priceHT = parseFloat((priceTTC / coefficient).toFixed(3));
        } else {
          priceHT = priceTTC;
        }
      }
    }

    // Calculate line amounts
    const montantSousTotalHT = Math.round(qty * priceHT * 1000) / 1000;
    const montantNetHT = Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
    const montantTTCLigne = Math.round(qty * priceTTC * 1000) / 1000;
    const montantTVA = Math.round((montantTTCLigne - montantNetHT) * 1000) / 1000;

    sousTotalHTValue += montantSousTotalHT;
    netHTValue += montantNetHT;
    totalTaxValue += montantTVA;
    grandTotalValue += montantTTCLigne;
  });

  // Round accumulated values
  sousTotalHTValue = Math.round(sousTotalHTValue * 1000) / 1000;
  netHTValue = Math.round(netHTValue * 1000) / 1000;
  totalTaxValue = Math.round(totalTaxValue * 1000) / 1000;
  grandTotalValue = Math.round(grandTotalValue * 1000) / 1000;

  let finalTotalValue = grandTotalValue;
  let discountAmountValue = 0;
  let netHTAfterDiscount = netHTValue;
  let totalTaxAfterDiscount = totalTaxValue;

  // Apply remise logic with proper rounding
  if (showRemise && Number(globalRemise) > 0) {
    if (remiseType === "percentage") {
      discountAmountValue = Math.round(netHTValue * (Number(globalRemise) / 100) * 1000) / 1000;
      netHTAfterDiscount = Math.round((netHTValue - discountAmountValue) * 1000) / 1000;
      
      const discountRatio = netHTAfterDiscount / netHTValue;
      totalTaxAfterDiscount = Math.round(totalTaxValue * discountRatio * 1000) / 1000;
      
      finalTotalValue = Math.round((netHTAfterDiscount + totalTaxAfterDiscount) * 1000) / 1000;
      
    } else if (remiseType === "fixed") {
      finalTotalValue = Math.round(Number(globalRemise) * 1000) / 1000;
      
      const tvaToHtRatio = totalTaxValue / netHTValue;
      const htAfterDiscount = Math.round(finalTotalValue / (1 + tvaToHtRatio) * 1000) / 1000;
      
      discountAmountValue = Math.round((netHTValue - htAfterDiscount) * 1000) / 1000;
      netHTAfterDiscount = htAfterDiscount;
      totalTaxAfterDiscount = Math.round(netHTAfterDiscount * tvaToHtRatio * 1000) / 1000;
    }
  }

  // Use discounted values for final display
  const displayNetHT = showRemise && Number(globalRemise) > 0 ? netHTAfterDiscount : netHTValue;
  const displayTotalTax = showRemise && Number(globalRemise) > 0 ? totalTaxAfterDiscount : totalTaxValue;

  return {
    sousTotalHT: Math.round(sousTotalHTValue * 1000) / 1000,
    netHT: Math.round(displayNetHT * 1000) / 1000,
    totalTax: Math.round(displayTotalTax * 1000) / 1000,
    grandTotal: Math.round(grandTotalValue * 1000) / 1000,
    finalTotal: Math.round(finalTotalValue * 1000) / 1000,
    discountAmount: Math.round(discountAmountValue * 1000) / 1000,
  };
}, [selectedArticles, showRemise, globalRemise, remiseType, editingHT, editingTTC]);

    const handleDelete = async () => {
        if (!bonCommande) return;

        try {
            await deleteDevis(bonCommande.id);
            setDeleteModal(false);
            fetchData();
            toast.success("Devis supprimé avec succès");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Échec de la suppression");
        }
    };

 const handleSubmit = async (values: any) => {
    try {
        if (isCreatingCommande) {
            const commandeData = {
                numeroCommande: values.numeroCommande,
                dateCommande: values.dateCommande,
                client_id: selectedClient!.id,
                vendeur_id: values.vendeur_id,
                status: values.status,
                notes: values.notes,
                taxMode,
                remise: globalRemise,
                remiseType: remiseType,
                devis_id: bonCommande?.id,
                articles: selectedArticles.map(item => ({
                    article_id: item.article_id,
                    quantite: item.quantite === "" ? 0 : Number(item.quantite), // Convert empty string to 0
                    prixUnitaire: item.prixUnitaire,
                    puv_ttc : item.prixTTC,
                    prix_ttc: item.prixTTC,
                    tva: item.tva ?? undefined,
                    remise: item.remise ?? undefined,
                    quantiteLivree:  0, // Ajoutez cette ligne

                }))
            };
          //  await createBonCommandeClientBasedOnDevis(commandeData);
            toast.success("Bon de commande créé avec succès");
        } else {
            const bonCommandeData = {
                ...values,
                taxMode,
                articles: selectedArticles.map(item => ({
                    article_id: item.article_id,
                    quantite: item.quantite === "" ? 0 : Number(item.quantite), // Convert empty string to 0 here too
                    prix_unitaire: item.prixUnitaire,
                    tva: item.tva ?? undefined,
                    remise: item.remise ?? undefined
                })),
                remise: globalRemise,
                remiseType: remiseType
            };

            if (isEdit && bonCommande) {
                await updateDevis(bonCommande.id, bonCommandeData);
                toast.success("Devis mis à jour avec succès");
            } else {
                await createDevis(bonCommandeData);
                toast.success("Devis créé avec succès");
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
            numeroCommande: isEdit
                ? bonCommande?.numeroCommande || ''
                : isCreatingCommande
                    ? nextNumeroCommande
                    : generateNextNumber(
                        bonsCommande,
                        moment().format('YYYY'),
                        'devis'
                    ),
            client_id: bonCommande?.client?.id ?? '',
            vendeur_id: bonCommande?.vendeur?.id ?? '',
            dateCommande: bonCommande?.dateCommande
                ? moment(bonCommande.dateCommande).format('YYYY-MM-DD')
                : moment().format('YYYY-MM-DD'),
            status: bonCommande?.status ?? 'Brouillon',
            notes: bonCommande?.notes ?? '',
        },
        validationSchema: Yup.object().shape({
            dateCommande: Yup.date().required('La date est requise'),
            numeroCommande: Yup.string().required('Le numéro est requis'),
            client_id: Yup.number().required('Le client est requis'),
            vendeur_id: Yup.number().required('Le vendeur est requis'),
            status: Yup.string().required('Le statut est requis'),
        }),
        onSubmit: handleSubmit,
    });

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
                header: "Client",
                accessorKey: "client",
                enableColumnFilter: false,
                cell: (cell: any) => `${cell.getValue()?.raison_sociale || ''}`,
            },
            {
                header: "Vendeur",
                accessorKey: "vendeur",
                enableColumnFilter: false,
                cell: (cell: any) => `${cell.getValue()?.nom || ''} ${cell.getValue()?.prenom || ''}`,
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
                header: "Total Après Remise",
                accessorKey: "articles",
                enableColumnFilter: false,
                cell: (cell: any) => {
                    const total = cell.getValue().reduce((sum: number, item: any) => {
                        const itemTotal = Number(item.quantite) * Number(item.prixUnitaire);
                        const itemDiscount = item.remise ? itemTotal * (Number(item.remise) / 100) : 0;
                        const taxableAmount = itemTotal - itemDiscount;
                        const itemTax = item.tva ? taxableAmount * (Number(item.tva) / 100) : 0;
                        return sum + taxableAmount + itemTax;
                    }, 0);
            
                    const globalDiscount = Number(cell.row.original.remise) || 0;
                    const discountType = cell.row.original.remiseType || "percentage";
            
                    let netAPayer: number = total;
                    if (globalDiscount > 0) {
                        if (discountType === "percentage") {
                            netAPayer = total * (1 - globalDiscount / 100);
                        } else {
                            // For fixed amount, the globalDiscount IS the final amount
                            netAPayer = globalDiscount;
                        }
                    }
            
                    return `${netAPayer.toFixed(2)} DT`;
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
                                      setSelectedArticles(
                                        cellProps.row.original.articles.map((item: any) => ({
                                          article_id: item.article.id,
                                          quantite: item.quantite,
                                          prixUnitaire: parseFloat(item.prixUnitaire),
                                          // USE prix_ttc FROM DATABASE OR CALCULATE FROM ARTICLE puv_ttc
                                          prixTTC: parseFloat(item.prix_ttc) || 
                                                   parseFloat(item.article?.puv_ttc) || 
                                                   (parseFloat(item.prixUnitaire) * (1 + ((item.tva || 0) / 100))),
                                          tva: item.tva != null ? parseFloat(item.tva) : null,
                                          remise: item.remise != null ? parseFloat(item.remise) : null,
                                          articleDetails: item.article
                                        }))
                                      );
                                        setGlobalRemise(cellProps.row.original.remise || 0);
                                        setRemiseType(cellProps.row.original.remiseType || "percentage");
                                        setShowRemise((cellProps.row.original.remise || 0) > 0);
                                        setSelectedClient(cellProps.row.original.client || null);
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

const toggleModal = useCallback(() => {
  if (modal) {
    setModal(false);
    setBonCommande(null);
    setSelectedArticles([]);
    setGlobalRemise(0);
    setRemiseType("percentage");
    setShowRemise(false);
    setIsCreatingCommande(false);
    setSelectedClient(null);
    setClientSearch("");
    setArticleSearch("");
    setFilteredArticles([]);
    setFilteredClients([]);
    validation.resetForm();
  } else {
    setModal(true);
    // Reset form for new devis
    if (!isEdit && !isCreatingCommande) {
      validation.setValues({
        numeroCommande: generateNextNumber(bonsCommande, moment().format('YYYY'), 'devis'),
        client_id: '',
        vendeur_id: '',
        dateCommande: moment().format('YYYY-MM-DD'),
        status: 'Brouillon',
        notes: '',
      });
    }
  }
}, [modal, isEdit, isCreatingCommande, bonsCommande]);


const handleAddArticle = (articleId: string) => {
  const article = articles.find((a) => a.id === parseInt(articleId));
  if (
    article &&
    !selectedArticles.some((item) => item.article_id === article.id)
  ) {
    const initialHT = article.puv_ht || 0;
    const initialTVA = article.tva || 0;
    // USE puv_ttc FROM ARTICLE IF AVAILABLE, OTHERWISE CALCULATE
    const initialTTC = article.puv_ttc || initialHT * (1 + (initialTVA || 0) / 100);

    setSelectedArticles([
      ...selectedArticles,
      {
        article_id: article.id,
        quantite: "", // Start with empty instead of 1
        prixUnitaire: initialHT,
        tva: initialTVA,
        remise: 0,
        prixTTC: Math.round(initialTTC * 1000) / 1000, // Use article's puv_ttc
        articleDetails: article,
      },
    ]);
  }
};

    const handleRemoveArticle = (articleId: number) => {
        setSelectedArticles(selectedArticles.filter(item => item.article_id !== articleId));
    };

const handleArticleChange = (
  articleId: number,
  field: string,
  value: any
) => {
  setSelectedArticles(prevArticles => 
    prevArticles.map((item) => {
      if (item.article_id === articleId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate HT when TVA changes
        if (field === "tva") {
          const currentTTC = item.prixTTC;
          const newTVA = value === "" ? 0 : Number(value);
          
          let newPriceHT = currentTTC;
          if (newTVA > 0) {
            newPriceHT = currentTTC / (1 + newTVA / 100);
          }
          
          // Use proper rounding
          updatedItem.prixUnitaire = Math.round(newPriceHT * 1000) / 1000;
          
          // Clear any editing states to use the new calculated values
          setEditingHT((prev) => {
            const newState = { ...prev };
            delete newState[articleId];
            return newState;
          });
          setEditingTTC((prev) => {
            const newState = { ...prev };
            delete newState[articleId];
            return newState;
          });
        }
        
        // Recalculate TTC when HT changes
        if (field === "prixUnitaire") {
          const currentHT = value;
          const currentTVA = item.tva || 0;
          
          let newPriceTTC = Number(currentHT);
          if (currentTVA > 0) {
            newPriceTTC = Number(currentHT) * (1 + currentTVA / 100);
          }
          
          // Use proper rounding
          updatedItem.prixTTC = Math.round(newPriceTTC * 1000) / 1000;
        }
        
        // Recalculate HT when TTC changes
        if (field === "prixTTC") {
          const currentTTC = value;
          const currentTVA = item.tva || 0;
          
          let newPriceHT = Number(currentTTC);
          if (currentTVA > 0) {
            newPriceHT = Number(currentTTC) / (1 + currentTVA / 100);
          }
          
          // Use proper rounding
          updatedItem.prixUnitaire = Math.round(newPriceHT * 1000) / 1000;
        }
        
        return updatedItem;
      }
      return item;
    })
  );
  
  // Keep the existing code for resetting editing states when TVA changes
  if (field === "tva") {
    setEditingHT((prev) => {
      const newState = { ...prev };
      delete newState[articleId];
      return newState;
    });
    setEditingTTC((prev) => {
      const newState = { ...prev };
      delete newState[articleId];
      return newState;
    });
  }
};

    const StatusBadge = ({ status }: { status?: "Brouillon" | "Confirme" | "Livre" | "Annule" | "Partiellement Livre" }) => {
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
            "Livre": {
                bgClass: "bg-success",
                textClass: "text-success",
                icon: "ri-truck-line"
            },
            "Annule": {
                bgClass: "bg-danger",
                textClass: "text-danger",
                icon: "ri-close-circle-line"
            },
            "Partiellement Livre": {
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

    return (
        <div className="page-content">
            <DeleteModal
                show={deleteModal}
                onDeleteClick={handleDelete}
                onCloseClick={() => setDeleteModal(false)}
            />

            <Container fluid>
                <BreadCrumb title="Offre De Prix" pageTitle="Commandes" />

                <Row>
                    <Col lg={12}>
                        <Card id="bonCommandeList">
                            <CardHeader className="card-header border-0">
                                <Row className="align-items-center gy-3">
                                    <div className="col-sm">
                                        <h5 className="card-title mb-0">Gestion des Offre De Prix</h5>
                                    </div>
                                    <div className="col-sm-auto">
                                        <div className="d-flex gap-1 flex-wrap">
                                            <Button
                                                color="secondary"
                                                onClick={() => {
                                                    setIsEdit(false);
                                                    setBonCommande(null);
                                                    toggleModal();
                                                }}
                                            >
                                                <i className="ri-add-line align-bottom me-1"></i> Ajouter Offre
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
                                        className={classnames({ active: activeTab === "4" })}
                                        onClick={() => setActiveTab("4")}
                                    >
                                        <i className="ri-checkbox-circle-line me-1 align-bottom"></i> Accepté
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



                          <Modal 
  isOpen={modal} 
  toggle={toggleModal} 
  centered 
  size="xl"
  className="invoice-modal"
  style={{ maxWidth: '1200px' }}
>
  <ModalHeader toggle={toggleModal} className="border-0 pb-3">
    <div className="d-flex align-items-center">
      <div className="modal-icon-wrapper bg-primary bg-opacity-10 rounded-circle p-2 me-3">
        <i className="ri-file-list-3-line text-primary fs-4"></i>
      </div>
      <div>
        <h4 className="mb-0 fw-bold text-dark">
          {isCreatingCommande 
            ? "Créer Bon de Commande Client" 
            : isEdit 
              ? "Modifier Devis" 
              : "Créer Devis"}
        </h4>
        <small className="text-muted">
          {isCreatingCommande 
            ? "Créer un bon de commande à partir de ce devis"
            : isEdit
              ? "Modifier les détails du devis existant"
              : "Créer un nouveau devis"}
        </small>
      </div>
    </div>
  </ModalHeader>

  <Form onSubmit={validation.handleSubmit} className="invoice-form">
    <ModalBody className="pt-0">
      {/* Header Information Section */}
      <Card className="border-0 shadow-sm mb-4">
        <CardBody className="p-4">
          <h5 className="fw-semibold mb-4 text-primary">
            <i className="ri-information-line me-2"></i>
            Informations Générales
          </h5>
          <Row>
            <Col md={4}>
              <div className="mb-3">
                <Label className="form-label-lg fw-semibold">Numéro*</Label>
                <Input
                  name="numeroCommande"
                  value={validation.values.numeroCommande}
                  onChange={validation.handleChange}
                  invalid={validation.touched.numeroCommande && !!validation.errors.numeroCommande}
                  readOnly={!isEdit && !isCreatingCommande}
                  className="form-control-lg"
                  placeholder="DIVER-0001/2024"
                />
                <FormFeedback className="fs-6">
                  {validation.errors.numeroCommande}
                </FormFeedback>
              </div>
            </Col>
            <Col md={4}>
              <div className="mb-3">
                <Label className="form-label-lg fw-semibold">Date*</Label>
                <Input
                  type="date"
                  name="dateCommande"
                  value={validation.values.dateCommande}
                  onChange={validation.handleChange}
                  invalid={validation.touched.dateCommande && !!validation.errors.dateCommande}
                  className="form-control-lg"
                />
                <FormFeedback className="fs-6">
                  {validation.errors.dateCommande as string }
                </FormFeedback>
              </div>
            </Col>
            <Col md={4}>
              <div className="mb-3">
                <Label className="form-label-lg fw-semibold">Statut*</Label>
                <Input
                  type="select"
                  name="status"
                  value={validation.values.status}
                  onChange={validation.handleChange}
                  className="form-control-lg"
                >
                  <option value="Brouillon">Brouillon</option>
                  <option value="Confirme">Confirmé</option>
                  <option value="Annule">Annulé</option>
                </Input>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Client and Vendeur Section */}
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-4">
              <h6 className="fw-semibold mb-3 text-primary">
                <i className="ri-user-line me-2"></i>
                Informations Client
              </h6>
              <div className="mb-3">
                <Label className="form-label-lg fw-semibold">Client*</Label>
                <div className="position-relative">
                  <Input
                    type="text"
                    placeholder="Rechercher client..."
                    value={selectedClient ? selectedClient.raison_sociale : clientSearch}
                    onChange={(e) => {
                      if (!e.target.value) {
                        setSelectedClient(null);
                        validation.setFieldValue("client_id", "");
                      }
                      setClientSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (clientSearch.length >= 1) {
                        setFilteredClients(clients);
                      }
                    }}
                    readOnly={!!selectedClient}
                    className="form-control-lg"
                  />
                  {selectedClient && (
                    <Button
                      color="link"
                      size="sm"
                      className="position-absolute end-0 top-50 translate-middle-y text-danger p-0 me-3"
                      onClick={() => {
                        setSelectedClient(null);
                        validation.setFieldValue("client_id", "");
                        setClientSearch("");
                      }}
                    >
                      <i className="ri-close-line fs-5"></i>
                    </Button>
                  )}
                </div>
                
                {/* Scrollable Dropdown Results */}
                {!selectedClient && clientSearch.length >= 1 && (
                  <div 
                    className="search-results mt-2 border rounded shadow-sm"
                    style={{ 
                      maxHeight: "200px", 
                      overflowY: "auto",
                      position: "absolute",
                      width: "100%",
                      zIndex: 1000,
                      backgroundColor: "white"
                    }}
                  >
                    {filteredClients.length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {filteredClients.map((c) => (
                          <li
                            key={c.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setSelectedClient(c);
                              validation.setFieldValue("client_id", c.id);
                              setClientSearch("");
                              setFilteredClients([]);
                            }}
                            style={{ cursor: "pointer", padding: "10px 15px" }}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-medium">{c.raison_sociale}</span>
                              <small className="text-muted">{c.telephone1}</small>
                            </div>
                            {c.adresse && (
                              <small className="text-muted d-block mt-1">
                                <i className="ri-map-pin-line me-1"></i>
                                {c.adresse}
                              </small>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-muted p-3 text-center">
                        <i className="ri-search-line me-1"></i>
                        Aucun résultat trouvé
                      </div>
                    )}
                  </div>
                )}
                
                {validation.touched.client_id && validation.errors.client_id && (
                  <div className="text-danger mt-1 fs-6">
                    <i className="ri-error-warning-line me-1"></i>
                    {validation.errors.client_id}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-4">
              <h6 className="fw-semibold mb-3 text-primary">
                <i className="ri-team-line me-2"></i>
                Informations Vendeur
              </h6>
              <div className="mb-3">
                <Label className="form-label-lg fw-semibold">Vendeur*</Label>
                <Input
                  type="select"
                  name="vendeur_id"
                  value={validation.values.vendeur_id}
                  onChange={validation.handleChange}
                  invalid={validation.touched.vendeur_id && !!validation.errors.vendeur_id}
                  className="form-control-lg"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  <option value="">Sélectionner un vendeur</option>
                  {vendeurs.map((vendeur) => (
                    <option key={vendeur.id} value={vendeur.id}>
                      {vendeur.nom} {vendeur.prenom}
                    </option>
                  ))}
                </Input>
                <FormFeedback className="fs-6">
                  {validation.errors.vendeur_id}
                </FormFeedback>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Global Discount Section    <Card className="border-0 shadow-sm mb-4">
        <CardBody className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold text-primary mb-0">
              <i className="ri-coupon-line me-2"></i>
              Remise Globale
            </h5>
            <div className="form-check form-switch form-switch-lg">
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
                className="form-check-input"
              />
              <Label for="showRemise" check className="form-check-label fw-semibold fs-6">
                Appliquer une remise
              </Label>
            </div>
          </div>

          {showRemise && (
            <Row className="g-3 mt-3">
              <Col md={4}>
                <div className="mb-3">
                  <Label className="form-label-lg fw-semibold">Type de remise</Label>
                  <Input
                    type="select"
                    value={remiseType}
                    onChange={(e) =>
                      setRemiseType(e.target.value as "percentage" | "fixed")
                    }
                    className="form-control-lg"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (DT)</option>
                  </Input>
                </div>
              </Col>
              <Col md={4}>
                <div className="mb-3">
                  <Label className="form-label-lg fw-semibold">
                    {remiseType === "percentage" ? "Pourcentage de remise" : "Montant de remise (DT)"}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step={remiseType === "percentage" ? "1" : "0.001"}
                    value={globalRemise === 0 ? "" : globalRemise}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setGlobalRemise(0);
                      } else {
                        const numValue = Number(value);
                        if (!isNaN(numValue) && numValue >= 0) {
                          setGlobalRemise(numValue);
                        }
                      }
                    }}
                    placeholder={remiseType === "percentage" ? "0-100%" : "Montant en DT"}
                    className="form-control-lg"
                  />
                </div>
              </Col>
              <Col md={4}>
                {showRemise && globalRemise > 0 && (
                  <div className="p-3 bg-primary bg-opacity-10 rounded border">
                    <div className="text-center">
                      <small className="text-muted d-block">Remise appliquée</small>
                      <strong className="fs-5 text-primary">
                        {remiseType === "percentage" 
                          ? `${globalRemise}%` 
                          : `${Number(globalRemise).toFixed(3)} DT`}
                      </strong>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          )}
        </CardBody>
      </Card> */}
   

      {/* Articles Section */}
      <Card className="border-0 shadow-sm mb-4">
        <CardBody className="p-4">
          <h5 className="fw-semibold mb-4 text-primary">
            <i className="ri-shopping-cart-line me-2"></i>
            Articles
          </h5>
          
          <div className="mb-4">
            <Label className="form-label-lg fw-semibold">Rechercher Article</Label>
            <div className="search-box position-relative">
              <Input
                type="text"
                placeholder="Rechercher article..."
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                className="form-control-lg ps-5"
              />
              <i className="ri-search-line search-icon position-absolute top-50 start-0 translate-middle-y ms-3 fs-5 text-muted"></i>
            </div>
            
            {/* Scrollable Dropdown Results */}
            {articleSearch.length >= 1 && (
              <div 
                className="search-results mt-2 border rounded shadow-sm"
                style={{ 
                  maxHeight: "300px", 
                  overflowY: "auto",
                  position: "relative",
                  zIndex: 1000,
                  backgroundColor: "white"
                }}
              >
                {filteredArticles.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {filteredArticles.map((article) => (
                      <li
                        key={article.id}
                        className="list-group-item list-group-item-action"
                        onClick={() => {
                          handleAddArticle(article.id.toString());
                          setArticleSearch("");
                          setFilteredArticles([]);
                        }}
                        style={{ 
                          cursor: "pointer", 
                          padding: "12px 15px",
                          opacity: selectedArticles.some(item => item.article_id === article.id) ? 0.6 : 1
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <strong className="d-block">{article.designation}</strong>
                            <small className="text-muted">
                              Réf: {article.reference} | Stock: {article.qte} | 
                              HT: {(Number(article.puv_ht) || 0).toFixed(3)} DT
                            </small>
                          </div>
                          {selectedArticles.some(item => item.article_id === article.id) ? (
                            <Badge color="secondary" className="fs-6">
                              <i className="ri-check-line me-1"></i>
                              Ajouté
                            </Badge>
                          ) : (
                            <Badge color="success" className="fs-6">
                              <i className="ri-add-line me-1"></i>
                              Ajouter
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted p-3 text-center">
                    <i className="ri-search-line me-2"></i>
                    Aucun article trouvé
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Articles Table */}
          {selectedArticles.length > 0 && (
            <div className="articles-table">
              <div className="table-responsive" style={{ maxHeight: "500px", overflow: "auto" }}>
                <Table className="table table-hover mb-0">
                  <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ width: "25%", minWidth: "200px" }}>Article</th>
                      <th style={{ width: "10%", minWidth: "100px" }}>Référence</th>
                      <th style={{ width: "8%", minWidth: "80px" }}>Quantité</th>
                      <th style={{ width: "12%", minWidth: "120px" }}>Prix Unitaire HT</th>
                      <th style={{ width: "12%", minWidth: "120px" }}>Prix Unitaire TTC</th>
                      <th style={{ width: "8%", minWidth: "80px" }}>TVA (%)</th>
                      <th style={{ width: "10%", minWidth: "100px" }}>Total HT</th>
                      <th style={{ width: "10%", minWidth: "100px" }}>Total TTC</th>
                      <th style={{ width: "5%", minWidth: "60px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedArticles.map((item, index) => {
                      const article = articles.find((a) => a.id === item.article_id) || item.articleDetails;
                      
                      const qty = Number(item.quantite) || 0;
                      
                      let priceHT = Number(item.prixUnitaire) || 0;
                      let priceTTC = Number(item.prixTTC) || 0;
                    // Replace the problematic section in Devis component with this:

if (editingTTC[item.article_id] !== undefined) {
  const editingValue = parseNumericInput(editingTTC[item.article_id]);
  if (!isNaN(editingValue) && editingValue >= 0) {
      priceTTC = parseFloat(editingValue.toFixed(3)); // ✅ Add this line
      const tvaRate = Number(item.tva) || 0;
      if (tvaRate > 0) {
          const coefficient = 1 + (tvaRate / 100);
          priceHT = parseFloat((priceTTC / coefficient).toFixed(3)); // ✅ Use same method
      } else {
          priceHT = priceTTC;
      }
  }
} else if (editingTTC[item.article_id] !== undefined) {
                        const editingValue = parseNumericInput(editingTTC[item.article_id]);
                        if (!isNaN(editingValue) && editingValue >= 0) {
                          priceTTC = editingValue;
                          const tvaRate = Number(item.tva) || 0;
                          priceHT = tvaRate > 0 ? priceTTC / (1 + tvaRate / 100) : priceTTC;
                        }
                      }

                      const montantHTLigne = (qty * priceHT).toFixed(3);
                      const montantTTCLigne = (qty * priceTTC).toFixed(3);

                      return (
                        <tr key={`${item.article_id}-${index}`} className="align-middle">
                          <td style={{ width: "25%" }}>
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1">
                                <h6 className="mb-0 fw-semibold fs-6">{article?.designation}</h6>
                              </div>
                            </div>
                          </td>
                          <td style={{ width: "10%" }}>
                            <Badge color="light" className="text-dark">
                              {article?.reference}
                            </Badge>
                          </td>
                          <td style={{ width: "8%" }}>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={item.quantite}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                  handleArticleChange(item.article_id, "quantite", "");
                                } else {
                                  const newQty = Math.max(0, Number(value));
                                  handleArticleChange(item.article_id, "quantite", newQty);
                                }
                              }}
                              className="table-input text-center"
                              style={{ width: "100%", fontSize: "0.9rem" }}
                            />
                          </td>
                          <td style={{ width: "12%" }}>
                            <Input
                              type="text"
                              value={
                                editingHT[item.article_id] !== undefined
                                  ? editingHT[item.article_id]
                                  : formatForDisplay(item.prixUnitaire)
                              }
                              onChange={(e) => {
                                let value = e.target.value;
                                if (value === "" || /^[0-9]*[,.]?[0-9]*$/.test(value)) {
                                  value = value.replace(".", ",");
                                  const commaCount = (value.match(/,/g) || []).length;
                                  if (commaCount <= 1) {
                                    setEditingHT((prev) => ({
                                      ...prev,
                                      [item.article_id]: value,
                                    }));
                                    const parsed = parseNumericInput(value);
                                    if (!isNaN(parsed) && parsed >= 0) {
                                      handleArticleChange(item.article_id, "prixUnitaire", parsed);
                                    }
                                  }
                                }
                              }}
                              className="table-input text-end"
                              style={{ width: "100%", fontSize: "0.9rem" }}
                            />
                          </td>
                          <td style={{ width: "12%" }}>
                            <Input
                              type="text"
                              value={
                                editingTTC[item.article_id] !== undefined
                                  ? editingTTC[item.article_id]
                                  : formatForDisplay(item.prixTTC)
                              }
                              onChange={(e) => {
                                let value = e.target.value;
                                if (value === "" || /^[0-9]*[,.]?[0-9]*$/.test(value)) {
                                  value = value.replace(".", ",");
                                  const commaCount = (value.match(/,/g) || []).length;
                                  if (commaCount <= 1) {
                                    setEditingTTC((prev) => ({
                                      ...prev,
                                      [item.article_id]: value,
                                    }));
                                    const parsed = parseNumericInput(value);
                                    if (!isNaN(parsed) && parsed >= 0) {
                                      handleArticleChange(item.article_id, "prixTTC", parsed);
                                    }
                                  }
                                }
                              }}
                              className="table-input text-end"
                              style={{ width: "100%", fontSize: "0.9rem" }}
                            />
                          </td>
                          <td style={{ width: "8%" }}>
                            <Input
                              type="select"
                              value={item.tva ?? ""}
                              onChange={(e) => {
                                const newTva = e.target.value === "" ? null : Number(e.target.value);
                                handleArticleChange(item.article_id, "tva", newTva);
                              }}
                              className="table-input"
                              style={{ width: "100%", fontSize: "0.9rem" }}
                            >
                              <option value="">Sélectionner</option>
                              {tvaOptions.map((option) => (
                                <option key={option.value ?? "null"} value={option.value ?? ""}>
                                  {option.label}
                                </option>
                              ))}
                            </Input>
                          </td>
                          <td style={{ width: "10%" }} className="text-end fw-semibold">
                            {montantHTLigne} DT
                          </td>
                          <td style={{ width: "10%" }} className="text-end fw-semibold text-primary">
                            {montantTTCLigne} DT
                          </td>
                          <td style={{ width: "5%" }}>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleRemoveArticle(item.article_id)}
                              className="btn-invoice-danger"
                              style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
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
            </div>
          )}

          {/* Calculation Summary */}
        {/* Calculation Summary */}
{selectedArticles.length > 0 && (
  <div className="calculation-summary mt-4">
    <h6 className="fw-semibold mb-3 text-primary">
      <i className="ri-calculator-line me-2"></i>
      Récapitulatif
    </h6>
    
    <Row>
      {/* Left Side - Remise Global */}
      <Col md={6}>
        <div className="remise-global-section h-100">
          <h6 className="fw-semibold">
            <i className="ri-coupon-line me-2"></i>
            Remise Globale
          </h6>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Label className="form-label fw-semibold mb-0">Activer remise</Label>
            <div className="form-check form-switch">
              <Input
                type="checkbox"
                id="showRemiseSummary"
                checked={showRemise}
                onChange={(e) => {
                  setShowRemise(e.target.checked);
                  if (!e.target.checked) {
                    setGlobalRemise(0);
                  }
                }}
                className="form-check-input"
              />
            </div>
          </div>

          {showRemise && (
            <div className="row g-2">
              <div className="col-12">
                <Label className="form-label fw-semibold">Type de remise</Label>
                <Input
                  type="select"
                  value={remiseType}
                  onChange={(e) =>
                    setRemiseType(e.target.value as "percentage" | "fixed")
                  }
                  className="form-control-sm"
                >
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (DT)</option>
                </Input>
              </div>
              <div className="col-12">
                <Label className="form-label fw-semibold">
                  {remiseType === "percentage" ? "Pourcentage" : "Montant (DT)"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step={remiseType === "percentage" ? "1" : "0.001"}
                  value={globalRemise === 0 ? "" : globalRemise}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setGlobalRemise(0);
                    } else {
                      const numValue = Number(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        setGlobalRemise(numValue);
                      }
                    }
                  }}
                  placeholder={remiseType === "percentage" ? "0-100%" : "Montant"}
                  className="form-control-sm"
                />
              </div>
            </div>
          )}
        </div>
      </Col>

      {/* Right Side - Calculations */}
      <Col md={6}>
        <div className="calculation-summary-right">
          <Table className="table table-borderless mb-0">
            <tbody>
              <tr className="real-time-update">
                <th className="text-end text-muted fs-6">Sous-total H.T.:</th>
                <td className="text-end fw-semibold fs-6">{sousTotalHT.toFixed(3)} DT</td>
              </tr>
              <tr className="real-time-update">
                <th className="text-end text-muted fs-6">Net H.T.:</th>
                <td className="text-end fw-semibold fs-6">{netHT.toFixed(3)} DT</td>
              </tr>
              <tr className="real-time-update">
                <th className="text-end text-muted fs-6">TVA:</th>
                <td className="text-end fw-semibold fs-6">{totalTax.toFixed(3)} DT</td>
              </tr>
              <tr className="real-time-update">
                <th className="text-end text-muted fs-6">Total TTC:</th>
                <td className="text-end fw-semibold fs-6 text-dark">
                  {grandTotal.toFixed(3)} DT
                </td>
              </tr>
              {showRemise && globalRemise > 0 && (
                <tr className="real-time-update">
                  <th className="text-end text-muted fs-6">
                    {remiseType === "percentage" 
                      ? `Remise (${globalRemise}%)` 
                      : `Remise (Montant fixe) ${((discountAmount / netHT) * 100).toFixed(1)}%`}
                  </th>
                  <td className="text-end text-danger fw-bold fs-6">
                    - {discountAmount.toFixed(3)} DT
                  </td>
                </tr>
              )}
              <tr className="final-total real-time-update border-top">
                <th className="text-end fs-5">NET À PAYER:</th>
                <td className="text-end fw-bold fs-5 text-primary">
                  {finalTotal.toFixed(3)} DT
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Col>
    </Row>
  </div>
)}
        </CardBody>
      </Card>

      {/* Notes Section */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-4">
          <h5 className="fw-semibold mb-3 text-primary">
            <i className="ri-sticky-note-line me-2"></i>
            Notes Additionnelles
          </h5>
          <div className="mb-3">
            <Label className="form-label-lg fw-semibold">Notes</Label>
            <Input
              type="textarea"
              name="notes"
              value={validation.values.notes}
              onChange={validation.handleChange}
              rows="3"
              className="form-control-lg"
              placeholder="Ajoutez des notes ou commentaires supplémentaires..."
            />
          </div>
        </CardBody>
      </Card>
    </ModalBody>

    <ModalFooter className="border-0 pt-4">
      <Button 
        color="light" 
        onClick={toggleModal} 
        className="btn-invoice fs-6 px-4"
      >
        <i className="ri-close-line me-2"></i> 
        Annuler
      </Button>
      <Button 
        color="primary" 
        type="submit" 
        className="btn-invoice btn-invoice-primary fs-6 px-4"
        disabled={selectedArticles.length === 0 || !selectedClient}
      >
        <i className="ri-save-line me-2"></i> 
        {isEdit ? "Modifier" : "Enregistrer"}
      </Button>
    </ModalFooter>
  </Form>
</Modal>

<Modal 
  isOpen={detailModal} 
  toggle={() => setDetailModal(false)} 
  size="xl" 
  centered 
  className="invoice-modal"
>
  <ModalHeader toggle={() => setDetailModal(false)} className="border-0 pb-3">
    <div className="d-flex align-items-center">
      <div className="modal-icon-wrapper bg-info bg-opacity-10 rounded-circle p-2 me-3">
        <i className="ri-file-list-3-line text-info fs-4"></i>
      </div>
      <div>
        <h4 className="mb-0 fw-bold text-dark">
          Devis #{selectedBonCommande?.numeroCommande}
        </h4>
        <small className="text-muted">
          {moment(selectedBonCommande?.dateCommande).format("DD MMM YYYY")}
        </small>
      </div>
    </div>
  </ModalHeader>

  <ModalBody className="pt-0">
    {selectedBonCommande && (
      <div className="bon-livraison-details">
        <Row className="g-3 mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <CardBody className="p-4">
                <h6 className="fw-semibold mb-3 text-primary">
                  <i className="ri-user-line me-2"></i>
                  Informations Client
                </h6>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{selectedBonCommande.client?.raison_sociale}</h5>
                    <p className="text-muted mb-1">
                      <i className="ri-phone-line me-1"></i>
                      {selectedBonCommande.client?.telephone1 || "N/A"}
                    </p>
                    <p className="text-muted mb-0">
                      <i className="ri-map-pin-line me-1"></i>
                      {selectedBonCommande.client?.adresse || "N/A"}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <CardBody className="p-4">
                <h6 className="fw-semibold mb-3 text-primary">
                  <i className="ri-information-line me-2"></i>
                  Informations Devis
                </h6>
                <div className="row g-2">
                  <div className="col-6">
                    <p className="mb-2">
                      <span className="text-muted d-block">Vendeur:</span>
                      <strong>
                        {selectedBonCommande.vendeur ? 
                          `${selectedBonCommande.vendeur.nom} ${selectedBonCommande.vendeur.prenom}` : 
                          "N/A"}
                      </strong>
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="mb-2">
                      <span className="text-muted d-block">Statut:</span>
                      <StatusBadge status={selectedBonCommande.status} />
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {selectedBonCommande.notes && (
          <Card className="border-0 shadow-sm mb-4">
            <CardBody className="p-4">
              <h6 className="fw-semibold mb-3 text-primary">
                <i className="ri-sticky-note-line me-2"></i>
                Notes
              </h6>
              <p className="mb-0 text-muted">{selectedBonCommande.notes}</p>
            </CardBody>
          </Card>
        )}

        <Card className="border-0 shadow-sm">
          <CardBody className="p-0">
            <div className="table-responsive">
              <Table className="table table-hover mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="ps-4">Article</th>
                    <th>Référence</th>
                    <th className="text-end">Quantité</th>
                    <th className="text-end">Prix Unitaire HT</th>
                    <th className="text-end">Prix Unitaire TTC</th>
                    <th className="text-end">TVA (%)</th>
                    <th className="text-end">Total HT</th>
                    <th className="text-end pe-4">Total TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBonCommande.articles.map((item, index) => {
                    const quantite = Number(item.quantite) || 0;
                    const priceHT = Number(item.prixUnitaire) || 0;
                    const tvaRate = Number(item.tva ?? 0);
                    const remiseRate = Number(item.remise || 0);


    // USE prix_ttc FROM DATABASE OR CALCULATE FROM ARTICLE puv_ttc
    const priceTTC = Number(item.prix_ttc) || 
                    Number(item.article?.puv_ttc) || 
                    priceHT * (1 + (tvaRate / 100));

                    const montantSousTotalHT = Math.round(quantite * priceHT * 1000) / 1000;
                    const montantNetHT = Math.round(quantite * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
                    const montantTTCLigne = Math.round(quantite * priceTTC * 1000) / 1000;

                    return (
                      <tr key={index} className={index % 2 === 0 ? "bg-light" : ""}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-semibold fs-6">{item.article?.designation}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge color="light" className="text-dark">
                            {item.article?.reference || '-'}
                          </Badge>
                        </td>
                        <td className="text-end fw-semibold">{quantite}</td>
                        <td className="text-end">{priceHT.toFixed(3)} DT</td>
                        <td className="text-end">{priceTTC.toFixed(3)} DT</td>
                        <td className="text-end">{tvaRate}%</td>
                        <td className="text-end fw-semibold">{montantNetHT.toFixed(3)} DT</td>
                        <td className="text-end pe-4 fw-semibold text-primary">{montantTTCLigne.toFixed(3)} DT</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            <div className="border-top p-4">
              <Row className="justify-content-end">
                <Col xs={8} sm={6} md={5} lg={4}>
                  {(() => {
                    let sousTotalHTValue = 0;
                    let netHTValue = 0;
                    let totalTaxValue = 0;
                    let grandTotalValue = 0;

                    selectedBonCommande.articles.forEach((article) => {
                      const qty = Number(article.quantite) || 0;
                      const tvaRate = Number(article.tva ?? 0);
                      const remiseRate = Number(article.remise || 0);
                      
                      const priceHT = Number(article.prixUnitaire) || 0;
                       const priceTTC = Number(article.prix_ttc) || 
                  priceHT * (1 + (tvaRate / 100));

                      const montantSousTotalHT = Math.round(qty * priceHT * 1000) / 1000;
                      const montantNetHT = Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
                      const montantTTCLigne = Math.round(qty * priceTTC * 1000) / 1000;
                      const montantTVA = Math.round((montantTTCLigne - montantNetHT) * 1000) / 1000;

                      sousTotalHTValue += montantSousTotalHT;
                      netHTValue += montantNetHT;
                      totalTaxValue += montantTVA;
                      grandTotalValue += montantTTCLigne;
                    });

                    sousTotalHTValue = Math.round(sousTotalHTValue * 1000) / 1000;
                    netHTValue = Math.round(netHTValue * 1000) / 1000;
                    totalTaxValue = Math.round(totalTaxValue * 1000) / 1000;
                    grandTotalValue = Math.round(grandTotalValue * 1000) / 1000;

                    const remiseValue = Number(selectedBonCommande.remise) || 0;
                    const remiseTypeValue = selectedBonCommande.remiseType || "percentage";
                    
                    let finalTotalValue = grandTotalValue;
                    let discountAmountValue = 0;
                    let netHTAfterDiscount = netHTValue;
                    let totalTaxAfterDiscount = totalTaxValue;
                    let discountPercentage = 0;

                    if (remiseValue > 0) {
                      if (remiseTypeValue === "percentage") {
                        discountAmountValue = Math.round(netHTValue * (remiseValue / 100) * 1000) / 1000;
                        netHTAfterDiscount = Math.round((netHTValue - discountAmountValue) * 1000) / 1000;
                        
                        const discountRatio = netHTAfterDiscount / netHTValue;
                        totalTaxAfterDiscount = Math.round(totalTaxValue * discountRatio * 1000) / 1000;
                        
                        finalTotalValue = Math.round((netHTAfterDiscount + totalTaxAfterDiscount) * 1000) / 1000;
                        
                      } else if (remiseTypeValue === "fixed") {
                        finalTotalValue = Math.round(Number(remiseValue) * 1000) / 1000;
                        
                        const tvaToHtRatio = totalTaxValue / netHTValue;
                        const htAfterDiscount = Math.round(finalTotalValue / (1 + tvaToHtRatio) * 1000) / 1000;
                        
                        discountAmountValue = Math.round((netHTValue - htAfterDiscount) * 1000) / 1000;
                        netHTAfterDiscount = htAfterDiscount;
                        totalTaxAfterDiscount = Math.round(netHTAfterDiscount * tvaToHtRatio * 1000) / 1000;
                        
                        discountPercentage = Math.round((discountAmountValue / netHTValue) * 100 * 100) / 100;
                      }
                    }

                    const displayNetHT = remiseValue > 0 ? netHTAfterDiscount : netHTValue;
                    const displayTotalTax = remiseValue > 0 ? totalTaxAfterDiscount : totalTaxValue;

                    return (
                      <Table className="table-sm table-borderless mb-0">
                        <tbody>
                          <tr className="real-time-update">
                            <th className="text-end text-muted fs-6">Sous-total H.T.:</th>
                            <td className="text-end fw-semibold fs-6">{sousTotalHTValue.toFixed(3)} DT</td>
                          </tr>
                          <tr className="real-time-update">
                            <th className="text-end text-muted fs-6">Net H.T.:</th>
                            <td className="text-end fw-semibold fs-6">{displayNetHT.toFixed(3)} DT</td>
                          </tr>
                          <tr className="real-time-update">
                            <th className="text-end text-muted fs-6">TVA:</th>
                            <td className="text-end fw-semibold fs-6">{displayTotalTax.toFixed(3)} DT</td>
                          </tr>
                          <tr className="real-time-update">
                            <th className="text-end text-muted fs-6">Total TTC:</th>
                            <td className="text-end fw-semibold fs-6 text-dark">
                              {grandTotalValue.toFixed(3)} DT
                            </td>
                          </tr>
                          {remiseValue > 0 && (
                            <tr className="real-time-update">
                              <th className="text-end text-muted fs-6">
                                {remiseTypeValue === "percentage" 
                                  ? `Remise (${remiseValue}%)` 
                                  : `Remise (Montant fixe) ${discountPercentage}%`}
                              </th>
                              <td className="text-end text-danger fw-bold fs-6">
                                - {discountAmountValue.toFixed(3)} DT
                              </td>
                            </tr>
                          )}
                          {remiseValue > 0 && (
                            <tr className="final-total real-time-update border-top">
                              <th className="text-end fs-5">NET À PAYER:</th>
                              <td className="text-end fw-bold fs-5 text-primary">
                                {finalTotalValue.toFixed(3)} DT
                              </td>
                            </tr>
                          )}
                          {!remiseValue && (
                            <tr className="final-total real-time-update border-top">
                              <th className="text-end fs-5">NET À PAYER:</th>
                              <td className="text-end fw-bold fs-5 text-primary">
                                {grandTotalValue.toFixed(3)} DT
                              </td>
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

  <ModalFooter className="border-0 pt-4">
    <Button
      color="success"
      size="md"
      onClick={() => {
        if (selectedBonCommande) {
          setBonCommande(selectedBonCommande);
          setSelectedClient(selectedBonCommande?.client ?? null);
   // In the create bon commande button click handler:
setSelectedArticles(selectedBonCommande.articles.map(item => ({
  article_id: item.article?.id || 0,
  quantite: item.quantite,
  prixUnitaire: typeof item.prixUnitaire === 'string' ? parseFloat(item.prixUnitaire) : item.prixUnitaire,
  // FIX: Handle both string and number types for prix_ttc
  prixTTC: Number(item.prix_ttc) || 
           Number(item.article?.puv_ttc) || 
           ((typeof item.prixUnitaire === 'string' ? parseFloat(item.prixUnitaire) : item.prixUnitaire) * (1 + ((item.tva || 0) / 100))),
  tva: item.tva != null ? (typeof item.tva === 'string' ? parseFloat(item.tva) : item.tva) : null,
  remise: item.remise != null ? (typeof item.remise === 'string' ? parseFloat(item.remise) : item.remise) : null,
})));
          setGlobalRemise(selectedBonCommande.remise || 0);
          setRemiseType(selectedBonCommande.remiseType || "percentage");
          setShowRemise((selectedBonCommande.remise || 0) > 0);
          setIsCreatingCommande(true);
          setIsEdit(false);
          validation.setValues({
            ...validation.values,
            numeroCommande: nextNumeroCommande,
            client_id: selectedBonCommande.client?.id ?? "",
            vendeur_id: selectedBonCommande.vendeur?.id ?? "",
            dateCommande: moment().format("YYYY-MM-DD"),
            status: "Brouillon",
            notes: selectedBonCommande.notes ?? ""
          });
          setModal(true);
        }
      }}
      className="btn-invoice btn-invoice-success me-2"
    >
      <i className="ri-file-list-3-line me-2"></i> Créer Bon de Commande
    </Button>
    
    <Button 
      color="light" 
      onClick={() => setDetailModal(false)}
      className="btn-invoice"
    >
      <i className="ri-close-line me-2"></i> Fermer
    </Button>
  </ModalFooter>
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

export default Devis;