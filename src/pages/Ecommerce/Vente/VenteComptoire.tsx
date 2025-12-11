import React, {
  Fragment,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  CardHeader,
  Row,
  Modal,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Form,
  ModalBody,
  ModalFooter,
  Label,
  Input,
  FormFeedback,
  Badge,
  Table,
  Button,
  InputGroupText,
  InputGroup,
  FormGroup,
} from "reactstrap";
import { Link } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import TableContainer from "../../../Components/Common/TableContainer";
import DeleteModal from "../../../Components/Common/DeleteModal";
import Loader from "../../../Components/Common/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import { useFormik } from "formik";
import moment from "moment";
import Flatpickr from "react-flatpickr";
import {
  fetchVenteComptoire,
  CreateVenteComptoire,
  updateventecomptoire,
  deleteventecomptoire,
  fetchNextVenteComptoireNumber,
} from "../../../Components/CommandeClient/CommandeClientServices";
import {
  fetchArticles,
  fetchClients,
  fetchVendeurs,
  fetchFournisseurs,
  fetchCategories,
} from "../../../Components/Article/ArticleServices";
import {
  Article,
  Client,
  Vendeur,
  BonCommandeClient,
  Categorie,
  Fournisseur,
} from "../../../Components/Article/Interfaces";
import classnames from "classnames";
import VenteComptoirePDFModal from "./VenteComptoirePDFModal";
import { pdf } from "@react-pdf/renderer";
import VenteComptoirePDF from "./VenteComptoirePDF";
import VenteComptoireReceiptPDF from "./VenteComptoireReceiptPDF";
import { useProfile } from "Components/Hooks/UserHooks";
import logo from "../../../assets/images/imglogo.png";

import {
  createClient,
  createArticle,
} from "../../../Components/Article/ArticleServices";
const VenteComptoire = () => {
  const [detailModal, setDetailModal] = useState(false);
  const [selectedBonCommande, setSelectedBonCommande] =
    useState<BonCommandeClient | null>(null);
  const [taxMode, setTaxMode] = useState<"HT" | "TTC">("HT");
  const [activeTab, setActiveTab] = useState("1");
  const [modal, setModal] = useState(false);
  const [bonsCommande, setBonsCommande] = useState<BonCommandeClient[]>([]);
  const [filteredBonsCommande, setFilteredBonsCommande] = useState<
    BonCommandeClient[]
  >([]);
  const [bonCommande, setBonCommande] = useState<BonCommandeClient | null>(
    null
  );
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
  const [nextNumeroCommande, setNextNumeroCommande] = useState("");
  const [remiseType, setRemiseType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [globalRemise, setGlobalRemise] = useState<number>(0);
  const [selectedArticles, setSelectedArticles] = useState<
    {
      article_id: number;
      quantite: number | "";
      prixUnitaire: number;
      prixTTC: number;
      tva?: number | null;
      remise?: number | null;
      articleDetails?: Article;
    }[]
  >([]);
  const [pdfModal, setPdfModal] = useState(false);
  const [selectedBonCommandeForPdf, setSelectedBonCommandeForPdf] =
    useState<BonCommandeClient | null>(null);
  const { userProfile, loading: profileLoading } = useProfile();
  const [pdfType, setPdfType] = useState<"facture" | "receipt">("facture");
  const [editingTTC, setEditingTTC] = useState<{ [key: number]: string }>({});
  const [editingHT, setEditingHT] = useState<{ [key: number]: string }>({});

  // Replace your current payment states with this:
  const [paymentMethods, setPaymentMethods] = useState<
    Array<{
      id: string;
      method: "especes" | "cheque" | "virement" | "traite" ; // Add "tpe"
      amount: number;
      numero?: string;
      banque?: string;
      dateEcheance?: string;
    }>
  >([
    {
      id: "1",
      method: "especes",
      amount: 0,
    },
  ]);

  const [modeReglement, setModeReglement] = useState<
  "especes" | "cheque" | "virement" | "carte" | "traite" | "autre" | "tpe" // Add "tpe"
  >("especes");
  const [numeroReglement, setNumeroReglement] = useState("");
  const [dateEcheance, setDateEcheance] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [banqueCheque, setBanqueCheque] = useState("");
  const [espaceNotes, setEspaceNotes] = useState("");
  const [montantVirement, setMontantVirement] = useState<number>(0);

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [subcategories, setSubcategories] = useState<Categorie[]>([]);
// Add near your other state declarations
const [focusedIndex, setFocusedIndex] = useState(-1);
const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null);
const [itemRefs, setItemRefs] = useState<React.RefObject<HTMLLIElement>[]>([]);
  const [clientModal, setClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    raison_sociale: "",
    designation: "",
    matricule_fiscal: "",
    register_commerce: "",
    adresse: "",
    ville: "",
    code_postal: "",
    telephone1: "",
    telephone2: "",
    email: "",
    status: "Actif" as "Actif" | "Inactif", // Fix the type
  });

  // Add these states
  const [articleModal, setArticleModal] = useState(false);
  const [newArticle, setNewArticle] = useState({
    reference: "",
    nom: "",
    designation: "",
    puv_ht: 0,
    puv_ttc: 0,
    pua_ht: 0,
    pua_ttc: 0,
    qte: 0,
    tva: 0,
    remise: 0,
    taux_fodec: false,
    type: "Non Consigné" as "Consigné" | "Non Consigné",
    image: "",
    on_website: false,
    is_offre: false,
    is_top_seller: false,
    is_new_arrival: false,
    website_description: "",
    website_images: [],
    website_order: 0,
    categorie_id: "",
    sous_categorie_id: "",
    fournisseur_id: "",
  });

  // Add these functions
  const handleCreateClient = async () => {
    try {
      await createClient(newClient);
      toast.success("Client créé avec succès");
      setClientModal(false);
      setNewClient({
        raison_sociale: "",
        designation: "",
        matricule_fiscal: "",
        register_commerce: "",
        adresse: "",
        ville: "",
        code_postal: "",
        telephone1: "",
        telephone2: "",
        email: "",
        status: "Actif" as "Actif" | "Inactif",
      });
      // Refresh clients list
      const clientsData = await fetchClients();
      setClients(clientsData);
    } catch (err) {
      toast.error("Erreur création client");
    }
  };

// Enhanced phone formatting function
const formatPhoneInput = (value: string): string => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  
  // Limit to 8 digits (Tunisian phone number length)
  const limited = cleaned.slice(0, 8);
  
  // Format as XX XXX XXX
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited.substring(0, 2)} ${limited.substring(2)}`;
  } else {
    return `${limited.substring(0, 2)} ${limited.substring(2, 5)} ${limited.substring(5, 8)}`;
  }
};

// Enhanced phone detection function
const isPhoneNumberInput = (value: string): boolean => {
  // Remove spaces for counting
  const cleanValue = value.replace(/\s/g, '');
  
  // If empty, not a phone number
  if (!cleanValue) return false;
  
  // Count digits
  const digitCount = (cleanValue.match(/\d/g) || []).length;
  const totalLength = cleanValue.length;
  
  // More lenient detection: if mostly digits OR if it's exactly 8 digits with spaces
  const isMostlyDigits = digitCount >= totalLength * 0.7;
  const isEightDigitsWithSpaces = cleanValue.length === 8 && digitCount === 8;
  const hasEightDigitsTotal = digitCount === 8;
  
  return isMostlyDigits || isEightDigitsWithSpaces || hasEightDigitsTotal;
};

// Display formatting function
const formatPhoneDisplay = (phone: string | null | undefined): string => {
  if (!phone) return 'N/A';
  
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 8) {
    return `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5, 8)}`;
  }
  return phone;
};
  // Function to normalize name for searching (remove accents, etc.)
  const normalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .trim();
  };

  // Add this function
  const calculateTTCForQuickCreate = (
    ht: number,
    tva: number,
    hasFodec: boolean
  ) => {
    const htValue = Number(ht) || 0;
    const tvaRate = Number(tva) || 0;
    const tvaAmount = htValue * (tvaRate / 100);
    const fodecAmount = hasFodec ? htValue * 0.01 : 0;
    return (htValue + tvaAmount + fodecAmount).toFixed(3);
  };

  // Add new payment method
  const addPaymentMethod = () => {
    setPaymentMethods((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        method: "especes",
        amount: 0,
      },
    ]);
  };

  // Remove payment method
  const removePaymentMethod = (id: string) => {
    if (paymentMethods.length > 1) {
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
    }
  };

  // Update payment method
  const updatePaymentMethod = (id: string, field: string, value: any) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => (pm.id === id ? { ...pm, [field]: value } : pm))
    );
  };

  const handleCreateArticle = async () => {
    try {
      // Calculate TTC values before sending
      const articleToCreate = {
        ...newArticle,
        pua_ttc: Number(
          calculateTTCForQuickCreate(
            newArticle.pua_ht,
            newArticle.tva,
            newArticle.taux_fodec
          )
        ),
        puv_ttc: Number(
          calculateTTCForQuickCreate(
            newArticle.puv_ht,
            newArticle.tva,
            newArticle.taux_fodec
          )
        ),
        categorie_id: newArticle.categorie_id
          ? Number(newArticle.categorie_id)
          : null,
        sous_categorie_id: newArticle.sous_categorie_id
          ? Number(newArticle.sous_categorie_id)
          : null,
        fournisseur_id: newArticle.fournisseur_id
          ? Number(newArticle.fournisseur_id)
          : null,
      };

      await createArticle(articleToCreate);
      toast.success("Article créé avec succès");
      setArticleModal(false);
      setNewArticle({
        reference: "",
        nom: "",
        designation: "",
        puv_ht: 0,
        puv_ttc: 0,
        pua_ht: 0,
        pua_ttc: 0,
        qte: 0,
        tva: 0,
        remise: 0,
        taux_fodec: false,
        type: "Non Consigné" as "Consigné" | "Non Consigné",
        image: "",
        on_website: false,
        is_offre: false,
        is_top_seller: false,
        is_new_arrival: false,
        website_description: "",
        website_images: [],
        website_order: 0,
        categorie_id: "",
        sous_categorie_id: "",
        fournisseur_id: "",
      });
      fetchData(); // Refresh articles list
    } catch (err) {
      toast.error("Erreur création article");
    }
  };

  // Add this effect for auto-calculation
  useEffect(() => {
    if (articleModal) {
      const puaTtc = calculateTTCForQuickCreate(
        newArticle.pua_ht,
        newArticle.tva,
        newArticle.taux_fodec
      );
      const puvTtc = calculateTTCForQuickCreate(
        newArticle.puv_ht,
        newArticle.tva,
        newArticle.taux_fodec
      );

      setNewArticle((prev) => ({
        ...prev,
        pua_ttc: Number(puaTtc),
        puv_ttc: Number(puvTtc),
      }));
    }
  }, [
    newArticle.pua_ht,
    newArticle.puv_ht,
    newArticle.tva,
    newArticle.taux_fodec,
    articleModal,
  ]);

  // Add this effect for subcategories
  useEffect(() => {
    if (newArticle.categorie_id) {
      const categoryId = parseInt(newArticle.categorie_id);
      const subs = categories.filter((cat) => cat.parent_id === categoryId);
      setSubcategories(subs);

      // Reset subcategory if parent category changes
      if (
        !subs.find((sub) => sub.id === parseInt(newArticle.sous_categorie_id))
      ) {
        setNewArticle((prev) => ({ ...prev, sous_categorie_id: "" }));
      }
    } else {
      setSubcategories([]);
      setNewArticle((prev) => ({ ...prev, sous_categorie_id: "" }));
    }
  }, [newArticle.categorie_id, categories]);

  const handleDirectPrint = async (
    bonCommande: BonCommandeClient,
    type: "facture" | "receipt"
  ) => {
    try {
      const PDFComponent =
        type === "facture" ? VenteComptoirePDF : VenteComptoireReceiptPDF;

      // Créer le blob PDF
      const pdfBlob = await pdf(
        <PDFComponent bonCommande={bonCommande} companyInfo={companyInfo} />
      ).toBlob();

      // Créer l'URL et ouvrir dans une nouvelle fenêtre
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, "_blank");

      if (printWindow) {
        // Attendre que le PDF soit chargé puis déclencher l'impression
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur impression:", error);
      toast.error("Erreur lors de l'impression");
    }
  };

  const openPdfModal = (
    bonCommande: BonCommandeClient,
    type: "facture" | "receipt"
  ) => {
    setSelectedBonCommandeForPdf(bonCommande);
    setPdfType(type);
    setPdfModal(true);
  };

  const tvaOptions = [
    { value: null, label: "Non applicable" },
    { value: 0, label: "0% (Exonéré)" },
    { value: 7, label: "7%" },
    { value: 10, label: "10%" },
    { value: 13, label: "13%" },
    { value: 19, label: "19%" },
    { value: 21, label: "21%" },
  ];

  const companyInfo = useMemo(
    () => ({
      name: userProfile?.company_name || "Votre Société",
      address: userProfile?.company_address || "Adresse",
      city: userProfile?.company_city || "Ville",
      phone: userProfile?.company_phone || "Téléphone",
      email: userProfile?.company_email || "Email",
      website: userProfile?.company_website || "Site web",
      taxId: userProfile?.company_tax_id || "MF",
      logo: logo,
      gsm: userProfile?.company_gsm,
    }),
    [userProfile]
  );
  const fetchNextNumber = useCallback(async () => {
    try {
      const numero = await fetchNextVenteComptoireNumber();
      setNextNumeroCommande(numero);
    } catch (err) {
      toast.error("Échec de la récupération du numéro de vente");
  
      const year = moment().format("YYYY");
  
      // always start from 925
      const DEFAULT_START = 925;
  
      // if bonsCommande exist, continue from max(bonsCommande.length + 1, 925)
      const safeSequence = Math.max(bonsCommande.length + 1, DEFAULT_START);
  
      const defaultNumber = `VENTE-${String(safeSequence).padStart(4, "0")}/${year}`;
  
      setNextNumeroCommande(defaultNumber);
    }
  }, [bonsCommande.length]);
  

  useEffect(() => {
    if (modal && !isEdit) {
      fetchNextNumber();
    }
  }, [modal, isEdit, fetchNextNumber]);

  useEffect(() => {
    if (articleSearch.length >= 3) {
      const filtered = articles.filter(
        (article) =>
          article.designation
            .toLowerCase()
            .includes(articleSearch.toLowerCase()) ||
          article.reference.toLowerCase().includes(articleSearch.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles([]);
    }
  }, [articleSearch, articles]);

  // Enhanced client search functionality
  // Client search functionality - same as Devis
  useEffect(() => {
    if (clientSearch.length >= 3) {
      const searchTerm = clientSearch.toLowerCase().trim();

      const filtered = clients.filter((client) => {
        // Search by name (partial match anywhere in the name)
        const nameMatch =
          client.raison_sociale?.toLowerCase().includes(searchTerm) ||
          client.designation?.toLowerCase().includes(searchTerm);

        // Search by phone - remove spaces for comparison
        const cleanSearchTerm = searchTerm.replace(/\s/g, "");
        const phoneMatch =
          client.telephone1?.replace(/\s/g, "").includes(cleanSearchTerm) ||
          client.telephone2?.replace(/\s/g, "").includes(cleanSearchTerm);

        return nameMatch || phoneMatch;
      });

      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  }, [clientSearch, clients]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        bonsData,
        clientsData,
        vendeursData,
        articlesData,
        categoriesData,
        fournisseursData,
      ] = await Promise.all([
        fetchVenteComptoire(),
        fetchClients(),
        fetchVendeurs(),
        fetchArticles(),
        fetchCategories(), // Add this
        fetchFournisseurs(), // Add this
      ]);

      setBonsCommande(bonsData);
      setFilteredBonsCommande(bonsData);
      setClients(clientsData);
      setVendeurs(vendeursData);
      setArticles(articlesData);
      setCategories(categoriesData); // Add this
      setFournisseurs(fournisseursData);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec du chargement des données"
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let result = [...bonsCommande];

    if (startDate && endDate) {
      const start = moment(startDate).startOf("day");
      const end = moment(endDate).endOf("day");
      result = result.filter((bon) => {
        const bonDate = moment(bon.dateCommande);
        return bonDate.isBetween(start, end, null, "[]");
      });
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (bon) =>
          bon.numeroCommande.toLowerCase().includes(searchLower) ||
          (bon.client?.raison_sociale &&
            bon.client.raison_sociale.toLowerCase().includes(searchLower)) ||
          (bon.client?.telephone1 &&
            bon.client.telephone1.includes(searchText)) ||
          (bon.client?.telephone2 && bon.client.telephone2.includes(searchText))
      );
    }

    setFilteredBonsCommande(result);
  }, [startDate, endDate, searchText, bonsCommande]);

  const openDetailModal = (bonCommande: BonCommandeClient) => {
    setSelectedBonCommande(bonCommande);
    setDetailModal(true);
  };

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

  const {
    sousTotalHT,
    netHT,
    totalTax,
    grandTotal,
    finalTotal,
    discountAmount,
  } = useMemo(() => {
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

      // Check for manual editing states
      if (editingHT[article.article_id] !== undefined) {
        const editingValue = parseNumericInput(editingHT[article.article_id]);
        if (!isNaN(editingValue) && editingValue >= 0) {
          priceHT = parseFloat(editingValue.toFixed(3));
          const tvaAmount =
            tvaRate > 0
              ? parseFloat(((priceHT * tvaRate) / 100).toFixed(3))
              : 0;
          priceTTC = parseFloat((priceHT + tvaAmount).toFixed(3));
        }
      } else if (editingTTC[article.article_id] !== undefined) {
        const editingValue = parseNumericInput(editingTTC[article.article_id]);
        if (!isNaN(editingValue) && editingValue >= 0) {
          priceTTC = parseFloat(editingValue.toFixed(3));
          if (tvaRate > 0) {
            const coefficient = 1 + tvaRate / 100;
            priceHT = parseFloat((priceTTC / coefficient).toFixed(3));
          } else {
            priceHT = priceTTC;
          }
        }
      }

      // Calculate line amounts
      const montantSousTotalHT = Math.round(qty * priceHT * 1000) / 1000;
      const montantNetHT =
        Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
      const montantTTCLigne = Math.round(qty * priceTTC * 1000) / 1000;
      const montantTVA =
        Math.round((montantTTCLigne - montantNetHT) * 1000) / 1000;

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
        discountAmountValue =
          Math.round(netHTValue * (Number(globalRemise) / 100) * 1000) / 1000;
        netHTAfterDiscount =
          Math.round((netHTValue - discountAmountValue) * 1000) / 1000;

        const discountRatio = netHTAfterDiscount / netHTValue;
        totalTaxAfterDiscount =
          Math.round(totalTaxValue * discountRatio * 1000) / 1000;

        finalTotalValue =
          Math.round((netHTAfterDiscount + totalTaxAfterDiscount) * 1000) /
          1000;
      } else if (remiseType === "fixed") {
        finalTotalValue = Math.round(Number(globalRemise) * 1000) / 1000;

        const tvaToHtRatio = totalTaxValue / netHTValue;
        const htAfterDiscount =
          Math.round((finalTotalValue / (1 + tvaToHtRatio)) * 1000) / 1000;

        discountAmountValue =
          Math.round((netHTValue - htAfterDiscount) * 1000) / 1000;
        netHTAfterDiscount = htAfterDiscount;
        totalTaxAfterDiscount =
          Math.round(netHTAfterDiscount * tvaToHtRatio * 1000) / 1000;
      }
    }

    // Use discounted values for final display
    const displayNetHT =
      showRemise && Number(globalRemise) > 0 ? netHTAfterDiscount : netHTValue;
    const displayTotalTax =
      showRemise && Number(globalRemise) > 0
        ? totalTaxAfterDiscount
        : totalTaxValue;

    return {
      sousTotalHT: Math.round(sousTotalHTValue * 1000) / 1000,
      netHT: Math.round(displayNetHT * 1000) / 1000,
      totalTax: Math.round(displayTotalTax * 1000) / 1000,
      grandTotal: Math.round(grandTotalValue * 1000) / 1000,
      finalTotal: Math.round(finalTotalValue * 1000) / 1000,
      discountAmount: Math.round(discountAmountValue * 1000) / 1000,
    };
  }, [selectedArticles, showRemise, globalRemise, remiseType]);

  const handleDelete = async () => {
    if (!bonCommande) return;

    try {
      await deleteventecomptoire(bonCommande.id);
      setDeleteModal(false);
      fetchData();
      toast.success("Vente supprimée avec succès");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Échec de la suppression"
      );
    }
  };

  // Calculate total amount from all payment methods

  // Calculate total payment amount
  // Calculate total payment amount - auto-set single payment to finalTotal
  const totalPaymentAmount = useMemo(() => {
    if (paymentMethods.length === 1) {
      // Auto-set single payment amount to finalTotal
      const singlePayment = paymentMethods[0];
      if (singlePayment.amount !== finalTotal) {
        // Update the amount automatically
        setTimeout(() => {
          updatePaymentMethod(singlePayment.id, "amount", finalTotal);
        }, 0);
      }
      return finalTotal;
    }
    return paymentMethods.reduce((sum, pm) => sum + (pm.amount || 0), 0);
  }, [paymentMethods, finalTotal]);

  // Check if payment total matches - always valid for single payment
  const isPaymentTotalValid = useMemo(() => {
    if (paymentMethods.length === 1) return true;
    return Math.abs(totalPaymentAmount - finalTotal) < 0.001;
  }, [totalPaymentAmount, finalTotal, paymentMethods.length]);

  const handleSubmit = async (values: any) => {
    try {
      // For single payment method, auto-set amount to finalTotal
      const processedPaymentMethods = paymentMethods.map((pm) => {
        if (paymentMethods.length === 1) {
          return { ...pm, amount: finalTotal };
        }
        return pm;
      });

      const processedTotalPaymentAmount =
        paymentMethods.length === 1 ? finalTotal : totalPaymentAmount;

      // Validate payment total only for multiple payments
      if (paymentMethods.length > 1 && !isPaymentTotalValid) {
        toast.error(
          `Le total des paiements (${processedTotalPaymentAmount.toFixed(
            3
          )} DT) ne correspond pas au montant à payer (${finalTotal.toFixed(
            3
          )} DT)`
        );
        return;
      }

      const venteData = {
        ...values,
        taxMode,
        client_id: selectedClient?.id,
        articles: selectedArticles.map((item) => ({
          article_id: item.article_id,
          quantite: item.quantite,
          prix_unitaire: item.prixUnitaire,
          tva: item.tva,
          remise: item.remise,
        })),
        remise: globalRemise,
        remiseType: remiseType,
        totalTVA: totalTax,
        totalTTC: grandTotal,
        totalTTCAfterRemise: finalTotal,
        // Use processed payment data
        paymentMethods: processedPaymentMethods,
        totalPaymentAmount: processedTotalPaymentAmount,
        espaceNotes,
      };

      // MISSING: Actual API call to save the data
      if (isEdit && bonCommande) {
        await updateventecomptoire(bonCommande.id, venteData);
        toast.success("Vente modifiée avec succès");
      } else {
        await CreateVenteComptoire(venteData);
        toast.success("Vente créée avec succès");
      }

      // Close modal and refresh data
      toggleModal();
      fetchData();
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      toast.error(err instanceof Error ? err.message : "Échec de l'opération");
    }
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      numeroCommande: isEdit
        ? bonCommande?.numeroCommande || ""
        : nextNumeroCommande,
      dateCommande: bonCommande?.dateCommande
        ? moment(bonCommande.dateCommande).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"),
      client_id: bonCommande?.client?.id ?? "",
      vendeur_id: bonCommande?.vendeur?.id ?? "",
      notes: bonCommande?.notes ?? "",
      // Add payment method fields
      modeReglement: bonCommande?.modeReglement || "especes",
      numeroReglement: bonCommande?.numeroReglement || "",
      dateEcheance: bonCommande?.dateEcheance
        ? moment(bonCommande.dateEcheance).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"),
      banqueCheque: bonCommande?.banqueCheque || "",
      espaceNotes: bonCommande?.espaceNotes || "",
    },
    validationSchema: Yup.object().shape({
      numeroCommande: Yup.string().required("Le numéro de vente est requis"),
      dateCommande: Yup.date().required("La date de commande est requise"),
      client_id: Yup.number().required("Le client est requis"),
      vendeur_id: Yup.number().required("Le vendeur est requis"),
      // Payment validation - SIMPLIFIED
      numeroReglement: Yup.string(),
      banqueCheque: Yup.string(),
      dateEcheance: Yup.string(),
    }),
    onSubmit: handleSubmit,
  });

  const toggleModal = useCallback(() => {
    if (modal) {
      setModal(false);
      setBonCommande(null);
      setSelectedArticles([]);
      setSelectedClient(null);
      setGlobalRemise(0);
      setRemiseType("percentage");
      setShowRemise(false);
      // Reset payment states
      setModeReglement("especes");
      setNumeroReglement("");
      setDateEcheance(moment().format("YYYY-MM-DD"));
      setBanqueCheque("");
      setEspaceNotes("");
      setMontantVirement(0);
      validation.resetForm();
    } else {
      setModal(true);
    }
  }, [modal]);

  const handleAddArticle = (articleId: string) => {
    const article = articles.find((a) => a.id === parseInt(articleId));
    if (
      article &&
      !selectedArticles.some((item) => item.article_id === article.id)
    ) {
      const initialHT = article.puv_ht || 0;
      const initialTVA = article.tva || 0;
      // USE puv_ttc FROM ARTICLE IF AVAILABLE, OTHERWISE CALCULATE
      const initialTTC =
        article.puv_ttc || initialHT * (1 + (initialTVA || 0) / 100);

      setSelectedArticles([
        ...selectedArticles,
        {
          article_id: article.id,
          quantite: "", // Start with empty instead of 0
          prixUnitaire: initialHT,
          prixTTC: Math.round(initialTTC * 1000) / 1000, // Use article's puv_ttc
          tva: initialTVA,
          remise: 0,
          articleDetails: article,
        },
      ]);
    }
  };
  const handleRemoveArticle = (articleId: number) => {
    setSelectedArticles(
      selectedArticles.filter((item) => item.article_id !== articleId)
    );
  };

  const handleArticleChange = (
    articleId: number,
    field: string,
    value: any
  ) => {
    setSelectedArticles((prevArticles) =>
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


  // Add these effects after your other effects
useEffect(() => {
  // Scroll to focused item
  if (focusedIndex >= 0 && itemRefs[focusedIndex]?.current && dropdownRef) {
    const item = itemRefs[focusedIndex].current;
    const dropdown = dropdownRef;
    
    if (item && dropdown) {
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;
      const dropdownTop = dropdown.scrollTop;
      const dropdownBottom = dropdownTop + dropdown.clientHeight;
      
      if (itemTop < dropdownTop) {
        dropdown.scrollTop = itemTop;
      } else if (itemBottom > dropdownBottom) {
        dropdown.scrollTop = itemBottom - dropdown.clientHeight;
      }
    }
  }
}, [focusedIndex, dropdownRef, itemRefs]);

useEffect(() => {
  // Reset item refs when filtered articles change
  setItemRefs(filteredArticles.map(() => React.createRef()));
  setFocusedIndex(-1); // Reset focus
}, [filteredArticles]);

useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      setFilteredArticles([]);
      setFocusedIndex(-1);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [dropdownRef]);

useEffect(() => {
  if (articleSearch.length >= 3) {
    const filtered = articles.filter(
      (article) =>
        article.designation
          .toLowerCase()
          .includes(articleSearch.toLowerCase()) ||
        article.reference.toLowerCase().includes(articleSearch.toLowerCase())
    );
    setFilteredArticles(filtered);
    setFocusedIndex(-1); // Reset focus on new search
  } else {
    setFilteredArticles([]);
    setFocusedIndex(-1);
  }
}, [articleSearch, articles]);


  const columns = useMemo(
    () => [
      {
        header: "Numéro",
        accessorKey: "numeroCommande",
        enableColumnFilter: false,
        cell: (cell: any) => (
          <Link
            to="#"
            className="text-body fw-medium"
            onClick={() => openDetailModal(cell.row.original)}
          >
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
        cell: (cell: any) => `${cell.getValue()?.raison_sociale || "N/A"}`,
      },
      {
        header: "Vendeur",
        accessorKey: "vendeur",
        enableColumnFilter: false,
        cell: (cell: any) =>
          `${cell.getValue()?.nom || ""} ${cell.getValue()?.prenom || ""}`,
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
      // Update the cell functions in columns:
      {
        header: "Total TTC",
        accessorKey: "articles",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const total = cell.getValue().reduce((sum: number, item: any) => {
            const qty = Number(item.quantite) || 1;
            // USE prix_ttc FROM DATABASE OR CALCULATE
            const priceTTC =
              Number(item.prix_ttc) ||
              Number(item.prixUnitaire) * (1 + (item.tva || 0) / 100);
            const remiseRate = Number(item.remise || 0);

            const montantHTLigne =
              qty * Number(item.prixUnitaire) * (1 - remiseRate / 100);
            const montantTTCLigne = qty * priceTTC;

            return sum + montantTTCLigne;
          }, 0);
          return `${total.toFixed(3)} DT`;
        },
      },
      {
        header: "Total Après Remise",
        accessorKey: "articles",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const total = cell.getValue().reduce((sum: number, item: any) => {
            const qty = Number(item.quantite) || 1;
            // USE prix_ttc FROM DATABASE OR CALCULATE (SAME AS TOTAL TTC)
            const priceTTC =
              Number(item.prix_ttc) ||
              Number(item.prixUnitaire) * (1 + (item.tva || 0) / 100);
            const remiseRate = Number(item.remise || 0);

            // Use prix_ttc for calculation (consistent with Total TTC)
            const montantTTCLigne = qty * priceTTC;

            return sum + montantTTCLigne;
          }, 0);

          const globalDiscount = Number(cell.row.original.remise) || 0;
          const discountType = cell.row.original.remiseType || "percentage";

          let netAPayer = total;
          if (globalDiscount > 0) {
            if (discountType === "percentage") {
              netAPayer = total * (1 - globalDiscount / 100);
            } else {
              netAPayer = globalDiscount;
            }
          }

          return `${netAPayer.toFixed(3)} DT`;
        },
      },
      {
        header: "Action",
        cell: (cellProps: any) => {
          const bonCommande = cellProps.row.original;
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item">
                <Link
                  to="#"
                  className="text-info d-inline-block"
                  onClick={() => openDetailModal(bonCommande)}
                >
                  <i className="ri-eye-line fs-16"></i>
                </Link>
              </li>
              <li className="list-inline-item edit">
                <Link
                  to="#"
                  className="text-primary d-inline-block edit-item-btn"
                  onClick={() => {
                    setBonCommande(bonCommande);
                    setSelectedClient(bonCommande.client);
                    setSelectedArticles(
                      bonCommande.articles.map((item: any) => ({
                        article_id: item.article.id,
                        quantite: item.quantite,
                        prixUnitaire: Number(item.prixUnitaire),
                        prixTTC:
                          Number(item.prix_ttc) ||
                          Number(item.article?.puv_ttc) ||
                          Number(item.prixUnitaire) *
                            (1 + (item.tva || 0) / 100), // Add prixTTC calculation

                        tva: item.tva != null ? Number(item.tva) : null,
                        remise:
                          item.remise != null ? Number(item.remise) : null,
                        articleDetails: item.article,
                      }))
                    );
                    setGlobalRemise(bonCommande.remise || 0);
                    setRemiseType(bonCommande.remiseType || "percentage");
                    setShowRemise(
                      !!bonCommande.remise && bonCommande.remise > 0
                    );
                    setIsEdit(true);
                    setModal(true);
                    // In your edit button click handler, add:
                    // In your edit button click handler, replace the payment method initialization:
                    // In your edit button click handler:
                    // In your edit button click handler:
                    setPaymentMethods(
                      (bonCommande as any)?.paymentMethods &&
                        (bonCommande as any).paymentMethods.length > 0
                        ? (bonCommande as any).paymentMethods.map(
                            (pm: any, index: number) => ({
                              id: pm.id || `edit-${index}`,
                              method: pm.method,
                              amount: Number(pm.amount) || 0,
                              numero: pm.numero || "",
                              banque: pm.banque || "",
                              dateEcheance: pm.dateEcheance || "",
                            })
                          )
                        : [
                            {
                              id: "1",
                              method:
                                (bonCommande as any)?.modeReglement ||
                                "especes",
                              amount:
                                Number(bonCommande?.totalAfterRemise) ||
                                finalTotal,
                              numero:
                                (bonCommande as any)?.numeroReglement || "",
                              banque: (bonCommande as any)?.banqueCheque || "",
                              dateEcheance:
                                (bonCommande as any)?.dateEcheance || "",
                            },
                          ]
                    );
                    setModeReglement(bonCommande.modeReglement || "especes");
                    setNumeroReglement(bonCommande.numeroReglement || "");
                    setDateEcheance(
                      bonCommande.dateEcheance
                        ? moment(bonCommande.dateEcheance).format("YYYY-MM-DD")
                        : moment().format("YYYY-MM-DD")
                    );
                    setBanqueCheque(bonCommande.banqueCheque || "");
                    setEspaceNotes(bonCommande.espaceNotes || "");
                    setMontantVirement(bonCommande.montantVirement || 0);
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
                    setBonCommande(bonCommande);
                    setDeleteModal(true);
                  }}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
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
        <BreadCrumb title="Vente Comptoire" pageTitle="Commandes" />

        <Row>
          <Col lg={12}>
            <Card id="bonCommandeList">
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="card-title mb-0">
                      Gestion des Ventes Comptoire
                    </h5>
                  </div>
                  <div className="col-sm-auto">
                    <div className="d-flex gap-1 flex-wrap">
                      <Button
                        color="secondary"
                        onClick={() => {
                          setIsEdit(false);
                          setBonCommande(null);
                          setSelectedArticles([]);
                          setSelectedClient(null);
                          setGlobalRemise(0);
                          setRemiseType("percentage");
                          setShowRemise(false);
                          validation.resetForm();
                          toggleModal();
                        }}
                      >
                        <i className="ri-add-line align-bottom me-1"></i>{" "}
                        Ajouter Vente Comptoire
                      </Button>
                    </div>
                  </div>
                </Row>
              </CardHeader>

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
                      <i className="ri-close-line align-bottom me-1"></i>{" "}
                      Réinitialiser
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
  isOpen={detailModal}
  toggle={() => setDetailModal(false)}
  size="xl"
  centered
  className="invoice-modal"
>
  <ModalHeader
    toggle={() => setDetailModal(false)}
    className="border-0 pb-3"
  >
    <div className="d-flex align-items-center">
      <div className="modal-icon-wrapper bg-info bg-opacity-10 rounded-circle p-2 me-3">
        <i className="ri-eye-line text-info fs-4"></i>
      </div>
      <div>
        <h4 className="mb-0 fw-bold text-dark">
          Vente Comptoire #{selectedBonCommande?.numeroCommande}
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

                <div className="client-info">
                  {selectedBonCommande.client ? (
                    <>
                      <div className="mb-2">
                        <strong className="text-dark fs-6">
                          {selectedBonCommande.client.raison_sociale}
                        </strong>
                      </div>
                      {selectedBonCommande.client.designation && (
                        <div className="mb-2">
                          <small className="text-muted">
                            {selectedBonCommande.client.designation}
                          </small>
                        </div>
                      )}
                      {selectedBonCommande.client.telephone1 && (
                        <div className="mb-1">
                          <i className="ri-phone-line me-2 text-muted"></i>
                          <span className="text-dark">
                            {formatPhoneDisplay(selectedBonCommande.client.telephone1)}
                          </span>
                        </div>
                      )}
                      {selectedBonCommande.client.telephone2 && (
                        <div className="mb-1">
                          <i className="ri-phone-line me-2 text-muted"></i>
                          <span className="text-dark">
                            {formatPhoneDisplay(selectedBonCommande.client.telephone2)}
                          </span>
                        </div>
                      )}
                      {selectedBonCommande.client.email && (
                        <div className="mb-1">
                          <i className="ri-mail-line me-2 text-muted"></i>
                          <span className="text-dark">
                            {selectedBonCommande.client.email}
                          </span>
                        </div>
                      )}
                      {selectedBonCommande.client.adresse && (
                        <div className="mb-1">
                          <i className="ri-map-pin-line me-2 text-muted"></i>
                          <span className="text-dark">
                            {selectedBonCommande.client.adresse}
                            {selectedBonCommande.client.ville && `, ${selectedBonCommande.client.ville}`}
                            {selectedBonCommande.client.code_postal && `, ${selectedBonCommande.client.code_postal}`}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-muted">
                      <i className="ri-user-unfollow-line me-2"></i>
                      Aucun client associé
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
                  <i className="ri-information-line me-2"></i>
                  Informations Vente
                </h6>
                <div className="row g-2">
                  <div className="col-6">
                    <p className="mb-2">
                      <span className="text-muted d-block">Vendeur:</span>
                      <strong>
                        {selectedBonCommande.vendeur
                          ? `${selectedBonCommande.vendeur.nom} ${selectedBonCommande.vendeur.prenom}`
                          : "N/A"}
                      </strong>
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="mb-2">
                      <span className="text-muted d-block">Statut:</span>
                      <Badge color="success" className="text-uppercase">
                        Terminé
                      </Badge>
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="mb-2">
                      <span className="text-muted d-block">Date:</span>
                      <strong>
                        {moment(selectedBonCommande.dateCommande).format("DD/MM/YYYY")}
                      </strong>
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="mb-2">
                      <span className="text-muted d-block">Numéro:</span>
                      <strong>{selectedBonCommande.numeroCommande}</strong>
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
                    <th className="text-end">Remise (%)</th>
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

                    const priceTTC =
                      Number(item.prix_ttc) ||
                      Number(item.article?.puv_ttc) ||
                      priceHT * (1 + tvaRate / 100);

                    const montantSousTotalHT =
                      Math.round(quantite * priceHT * 1000) / 1000;
                    const montantNetHT =
                      Math.round(
                        quantite * priceHT * (1 - remiseRate / 100) * 1000
                      ) / 1000;
                    const montantTTCLigne =
                      Math.round(quantite * priceTTC * 1000) / 1000;

                    return (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-light" : ""}
                      >
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1">
                              <h6 className="mb-0 fw-semibold fs-6">
                                {item.article?.designation}
                              </h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge color="light" className="text-dark">
                            {item.article?.reference || "-"}
                          </Badge>
                        </td>
                        <td className="text-end fw-semibold">{quantite}</td>
                        <td className="text-end">{priceHT.toFixed(3)} DT</td>
                        <td className="text-end">{priceTTC.toFixed(3)} DT</td>
                        <td className="text-end">{tvaRate}%</td>
                        <td className="text-end">{remiseRate}%</td>
                        <td className="text-end fw-semibold">
                          {montantNetHT.toFixed(3)} DT
                        </td>
                        <td className="text-end pe-4 fw-semibold text-primary">
                          {montantTTCLigne.toFixed(3)} DT
                        </td>
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
                      const priceTTC =
                        Number(article.prix_ttc) ||
                        Number(article.article?.puv_ttc) ||
                        priceHT * (1 + tvaRate / 100);

                      const montantSousTotalHT =
                        Math.round(qty * priceHT * 1000) / 1000;
                      const montantNetHT =
                        Math.round(
                          qty * priceHT * (1 - remiseRate / 100) * 1000
                        ) / 1000;
                      const montantTTCLigne =
                        Math.round(qty * priceTTC * 1000) / 1000;
                      const montantTVA =
                        Math.round((montantTTCLigne - montantNetHT) * 1000) /
                        1000;

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
                        discountAmountValue =
                          Math.round(netHTValue * (remiseValue / 100) * 1000) /
                          1000;
                        netHTAfterDiscount =
                          Math.round((netHTValue - discountAmountValue) * 1000) /
                          1000;

                        const discountRatio = netHTAfterDiscount / netHTValue;
                        totalTaxAfterDiscount =
                          Math.round(totalTaxValue * discountRatio * 1000) / 1000;

                        finalTotalValue =
                          Math.round(
                            (netHTAfterDiscount + totalTaxAfterDiscount) * 1000
                          ) / 1000;
                      } else if (remiseTypeValue === "fixed") {
                        finalTotalValue = Math.round(Number(remiseValue) * 1000) / 1000;

                        const tvaToHtRatio = totalTaxValue / netHTValue;
                        const htAfterDiscount =
                          Math.round((finalTotalValue / (1 + tvaToHtRatio)) * 1000) /
                          1000;

                        discountAmountValue =
                          Math.round((netHTValue - htAfterDiscount) * 1000) / 1000;
                        netHTAfterDiscount = htAfterDiscount;
                        totalTaxAfterDiscount =
                          Math.round(netHTAfterDiscount * tvaToHtRatio * 1000) / 1000;

                        discountPercentage =
                          Math.round((discountAmountValue / netHTValue) * 100 * 100) /
                          100;
                      }
                    }

                    const displayNetHT =
                      remiseValue > 0 ? netHTAfterDiscount : netHTValue;
                    const displayTotalTax =
                      remiseValue > 0 ? totalTaxAfterDiscount : totalTaxValue;

                    return (
                      <Table className="table-sm table-borderless mb-0">
                        <tbody>
                          <tr className="real-time-update">
                            <th className="text-end text-muted fs-6">
                              Sous-total H.T.:
                            </th>
                            <td className="text-end fw-semibold fs-6">
                              {sousTotalHTValue.toFixed(3)} DT
                            </td>
                          </tr>
                          <tr className="real-time-update">
                            <th className="text-end text-muted fs-6">
                              Net H.T.:
                            </th>
                            <td className="text-end fw-semibold fs-6">
                              {displayNetHT.toFixed(3)} DT
                            </td>
                          </tr>
                          <tr className="real-time-update">
                            <th className="text-end text-muted fs-6">
                              TVA:
                            </th>
                            <td className="text-end fw-semibold fs-6">
                              {displayTotalTax.toFixed(3)} DT
                            </td>
                          </tr>
                          <tr className="real-time-update">
                            <th className="text-end text-muted fs-6">
                              Total TTC:
                            </th>
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
                              <th className="text-end fs-5">
                                NET À PAYER:
                              </th>
                              <td className="text-end fw-bold fs-5 text-primary">
                                {finalTotalValue.toFixed(3)} DT
                              </td>
                            </tr>
                          )}
                          {!remiseValue && (
                            <tr className="final-total real-time-update border-top">
                              <th className="text-end fs-5">
                                NET À PAYER:
                              </th>
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

        {/* Informations de Paiement */}
        <Card className="border-0 shadow-sm mt-4">
          <CardBody className="p-4">
            <h6 className="fw-semibold mb-3 text-primary">
              <i className="ri-bank-card-line me-2"></i>
              Informations de Paiement
            </h6>
            
            {selectedBonCommande.paymentMethods && 
            selectedBonCommande.paymentMethods.length > 0 ? (
              <div className="payment-methods">
                {selectedBonCommande.paymentMethods.map((payment: any, index: number) => (
                  <div key={payment.id || index} className="border rounded p-3 mb-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-semibold mb-0 text-dark">
                        Paiement #{index + 1}
                      </h6>
                      <Badge 
                        color={
                          payment.method === 'especes' ? 'success' :
                          payment.method === 'cheque' ? 'warning' :
                          payment.method === 'virement' ? 'info' :
                          payment.method === 'traite' ? 'primary' : 'secondary'
                        }
                      >
                        {payment.method === 'especes' ? 'Espèces' :
                         payment.method === 'cheque' ? 'Chèque' :
                         payment.method === 'virement' ? 'Virement' :
                         payment.method === 'traite' ? 'Traite' : 'Autre'}
                      </Badge>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <strong>Montant:</strong> {Number(payment.amount || 0).toFixed(3)} DT
                      </div>
                      
                      {payment.numero && (
                        <div className="col-md-6">
                          <strong>Numéro:</strong> {payment.numero}
                        </div>
                      )}
                      
                      {payment.banque && (
                        <div className="col-md-6">
                          <strong>Banque:</strong> {payment.banque}
                        </div>
                      )}
                      
                      {payment.dateEcheance && (
                        <div className="col-md-6">
                          <strong>Date Échéance:</strong> {moment(payment.dateEcheance).format('DD/MM/YYYY')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="total-payment border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="fs-6">Total Paiements:</strong>
                    <strong className="fs-5 text-primary">
                      {selectedBonCommande.paymentMethods
                        .reduce((sum: number, pm: any) => sum + (Number(pm.amount) || 0), 0)
                        .toFixed(3)} DT
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted">
                <i className="ri-information-line me-2"></i>
                Aucune information de paiement disponible
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    )}
  </ModalBody>

  <ModalFooter className="border-0 pt-4">
    {selectedBonCommande && (
      <>
        <Button
          color="primary"
          onClick={() => openPdfModal(selectedBonCommande, "facture")}
          className="btn-invoice btn-invoice-primary me-2"
        >
          <i className="ri-file-pdf-line me-2"></i> Voir Facture PDF
        </Button>

        <Button
          color="success"
          onClick={() => handleDirectPrint(selectedBonCommande, "receipt")}
          className="btn-invoice btn-invoice-success me-2"
        >
          <i className="ri-printer-line me-2"></i> Imprimer Reçu
        </Button>

        <Button
          color="info"
          onClick={() => {
            setBonCommande(selectedBonCommande);
            setSelectedClient(selectedBonCommande.client || null);
            setSelectedArticles(
              selectedBonCommande.articles.map((item: any) => ({
                article_id: item.article?.id || 0,
                quantite: item.quantite,
                prixUnitaire:
                  typeof item.prixUnitaire === "string"
                    ? parseFloat(item.prixUnitaire)
                    : item.prixUnitaire,
                prixTTC:
                  Number(item.prix_ttc) ||
                  Number(item.article?.puv_ttc) ||
                  (typeof item.prixUnitaire === "string"
                    ? parseFloat(item.prixUnitaire)
                    : item.prixUnitaire) *
                    (1 + (item.tva || 0) / 100),
                tva:
                  item.tva != null
                    ? typeof item.tva === "string"
                      ? parseFloat(item.tva)
                      : item.tva
                    : null,
                remise:
                  item.remise != null
                    ? typeof item.remise === "string"
                      ? parseFloat(item.remise)
                      : item.remise
                    : null,
                articleDetails: item.article,
              }))
            );
            setGlobalRemise(selectedBonCommande.remise || 0);
            setRemiseType(selectedBonCommande.remiseType || "percentage");
            setShowRemise((selectedBonCommande.remise || 0) > 0);
            setIsEdit(true);
            setModal(true);
            setDetailModal(false);
          }}
          className="btn-invoice btn-invoice-info me-2"
        >
          <i className="ri-pencil-line me-2"></i> Modifier
        </Button>
      </>
    )}
    <Button
      color="light"
      onClick={() => setDetailModal(false)}
      className="btn-invoice"
    >
      <i className="ri-close-line me-2"></i> Fermer
    </Button>
  </ModalFooter>
</Modal>

                <Modal
                  isOpen={modal}
                  toggle={toggleModal}
                  centered
                  size="xl"
                  className="invoice-modal"
                  style={{ maxWidth: "1200px" }}
                >
                  <ModalHeader toggle={toggleModal} className="border-0 pb-3">
                    <div className="d-flex align-items-center">
                      <div className="modal-icon-wrapper bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="ri-shopping-cart-line text-primary fs-4"></i>
                      </div>
                      <div>
                        <h4 className="mb-0 fw-bold text-dark">
                          {isEdit
                            ? "Modifier Vente Comptoire"
                            : "Créer Vente Comptoire"}
                        </h4>
                        <small className="text-muted">
                          {isEdit
                            ? "Modifier les détails de la vente comptoire existante"
                            : "Créer une nouvelle vente comptoire"}
                        </small>
                      </div>
                    </div>
                  </ModalHeader>

                  <Form
                    onSubmit={validation.handleSubmit}
                    className="invoice-form"
                  >
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
                                <Label className="form-label-lg fw-semibold">
                                  Numéro*
                                </Label>
                                <Input
                                  name="numeroCommande"
                                  value={validation.values.numeroCommande}
                                  onChange={validation.handleChange}
                                  invalid={
                                    validation.touched.numeroCommande &&
                                    !!validation.errors.numeroCommande
                                  }
                                  readOnly={isEdit}
                                  className="form-control-lg"
                                  placeholder="VC202400001"
                                />
                                <FormFeedback className="fs-6">
                                  {validation.errors.numeroCommande}
                                </FormFeedback>
                              </div>
                            </Col>
                            <Col md={4}>
                              <div className="mb-3">
                                <Label className="form-label-lg fw-semibold">
                                  Date*
                                </Label>
                                <Input
                                  type="date"
                                  name="dateCommande"
                                  value={validation.values.dateCommande}
                                  onChange={validation.handleChange}
                                  invalid={
                                    validation.touched.dateCommande &&
                                    !!validation.errors.dateCommande
                                  }
                                  className="form-control-lg"
                                />
                                <FormFeedback className="fs-6">
                                  {validation.errors.dateCommande as string}
                                </FormFeedback>
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
                              {/* Client Search Section - Updated */}
                              <div className="mb-3">
  <Label className="form-label-lg fw-semibold">
    Client*
    {!selectedClient && (
      <button
        type="button"
        className="btn btn-link text-primary p-0 ms-2"
        onClick={() => setClientModal(true)}
        title="Ajouter un nouveau client"
        style={{ fontSize: "0.8rem" }}
      >
        <i className="ri-add-line me-1"></i>
        Nouveau client
      </button>
    )}
  </Label>
  
  <div className="position-relative">
    <Input
      type="text"
      placeholder="Rechercher client par nom ou téléphone..."
      value={
        selectedClient
          ? selectedClient.raison_sociale
          : clientSearch
      }
      onChange={(e) => {
        const value = e.target.value;

        if (!value) {
          setSelectedClient(null);
          validation.setFieldValue("client_id", "");
          setClientSearch("");
        } else {
          // Enhanced phone detection - check if input looks like a phone number
          const isLikelyPhoneNumber = isPhoneNumberInput(value);
          
          if (isLikelyPhoneNumber) {
            const formatted = formatPhoneInput(value);
            setClientSearch(formatted);
          } else {
            setClientSearch(value);
          }
        }
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
                                {/* Client Dropdown Results - Updated to show phone numbers */}
                                {!selectedClient &&
                                  clientSearch.length >= 1 && (
                                    <div
                                      className="search-results mt-2 border rounded shadow-sm"
                                      style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                        position: "absolute",
                                        width: "100%",
                                        zIndex: 9999,
                                        backgroundColor: "white",
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
                                                validation.setFieldValue(
                                                  "client_id",
                                                  c.id
                                                );
                                                setClientSearch("");
                                                setFilteredClients([]);
                                              }}
                                              style={{
                                                cursor: "pointer",
                                                padding: "10px 15px",
                                              }}
                                            >
                                              <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium">
                                                  {c.raison_sociale}
                                                </span>
                                                <small className="text-muted">
                                                  {c.telephone1 || "N/A"}
                                                </small>
                                              </div>
                                              <div className="d-flex justify-content-between align-items-center mt-1">
                                                <small className="text-muted">
                                                  {c.designation && (
                                                    <span className="me-2">
                                                      {c.designation}
                                                    </span>
                                                  )}
                                                </small>
                                                {c.telephone2 && (
                                                  <small className="text-muted">
                                                    {c.telephone2}
                                                  </small>
                                                )}
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
                                          <i className="ri-search-line me-2"></i>
                                          Aucun client trouvé
                                        </div>
                                      )}
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
                                <Label className="form-label-lg fw-semibold">
                                  Vendeur*
                                </Label>
                                <Input
                                  type="select"
                                  name="vendeur_id"
                                  value={validation.values.vendeur_id}
                                  onChange={validation.handleChange}
                                  invalid={
                                    validation.touched.vendeur_id &&
                                    !!validation.errors.vendeur_id
                                  }
                                  className="form-control-lg"
                                  style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                  }}
                                >
                                  <option value="">
                                    Sélectionner un vendeur
                                  </option>
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

                      {/* Global Discount Section :  <Card className="border-0 shadow-sm mb-4">
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
      <Label className="form-label-lg fw-semibold">
        Rechercher Article
      </Label>
      {/* Update the article search input */}
      <div className="search-box position-relative">
        <Input
          type="text"
          placeholder="Rechercher article..."
          value={articleSearch}
          onChange={(e) => {
            setArticleSearch(e.target.value);
            setFocusedIndex(-1); // Reset focus when typing
          }}
          onKeyDown={(e) => {
            if (filteredArticles.length > 0) {
              // Handle arrow down
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setFocusedIndex(prev => 
                  prev < filteredArticles.length - 1 ? prev + 1 : 0
                );
              }
              // Handle arrow up
              else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setFocusedIndex(prev => 
                  prev > 0 ? prev - 1 : filteredArticles.length - 1
                );
              }
              // Handle Enter to select focused item
              else if (e.key === 'Enter' && focusedIndex >= 0) {
                e.preventDefault();
                const article = filteredArticles[focusedIndex];
                handleAddArticle(article.id.toString());
                setArticleSearch("");
                setFilteredArticles([]);
                setFocusedIndex(-1);
              }
              // Handle Enter to select first item when no focus
              else if (e.key === 'Enter' && filteredArticles.length > 0 && focusedIndex === -1) {
                e.preventDefault();
                const firstArticle = filteredArticles[0];
                handleAddArticle(firstArticle.id.toString());
                setArticleSearch("");
                setFilteredArticles([]);
                setFocusedIndex(-1);
              }
            }
          }}
          className="form-control-lg ps-5 pe-5"
        />
        <i className="ri-search-line search-icon position-absolute top-50 start-0 translate-middle-y ms-3"></i>
        <button
          type="button"
          className="btn btn-link text-primary position-absolute end-0 top-50 translate-middle-y p-0 me-3"
          onClick={() => setArticleModal(true)}
          title="Ajouter un nouvel article"
        >
          <i className="ri-add-line fs-5"></i>
        </button>
      </div>

      {/* Update the dropdown container */}
      {articleSearch.length >= 1 && (
        <div
          ref={setDropdownRef}
          className="search-results mt-2 border rounded shadow-sm"
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            zIndex: 1000,
            backgroundColor: "white",
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {filteredArticles.length > 0 ? (
            <ul className="list-group list-group-flush">
              {filteredArticles.map((article, index) => {
                // Create ref for each item
                const itemRef = React.createRef<HTMLLIElement>();
                if (!itemRefs[index]) {
                  itemRefs[index] = itemRef;
                }

                return (
                  <li
                    key={article.id}
                    ref={itemRefs[index]}
                    className={`list-group-item list-group-item-action ${
                      focusedIndex === index ? 'active' : ''
                    }`}
                    onClick={() => {
                      handleAddArticle(article.id.toString());
                      setArticleSearch("");
                      setFilteredArticles([]);
                      setFocusedIndex(-1);
                    }}
                    style={{
                      cursor: "pointer",
                      padding: "12px 15px",
                      opacity: selectedArticles.some(
                        (item) => item.article_id === article.id
                      )
                        ? 0.6
                        : 1,
                      backgroundColor: focusedIndex === index ? '#e7f1ff' : 'transparent',
                      borderLeft: focusedIndex === index ? '4px solid #0d6efd' : 'none',
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        {/* Show reference first in larger font - MATCHING PREVIOUS STYLE */}
                        <div className="d-flex align-items-center mb-1">
                          <strong className="fs-6 me-2 text-primary">
                            {article.reference}
                          </strong>
                          <span className="badge bg-light text-dark me-2">
                            Stock: {article.qte || 0}
                          </span>
                        </div>
                        {/* Show designation in smaller font */}
                        <small className="text-muted d-block" style={{ fontSize: "0.85rem" }}>
                          {article.designation}
                        </small>
                        {/* Show TTC price prominently */}
                        <div className="mt-1">
                          <span className="badge bg-success text-white">
                            TTC: {(Number(article.puv_ttc) || 0).toFixed(3)} DT
                          </span>
                          {article.tva && article.tva > 0 && (
                            <span className="badge bg-info ms-1">
                              TVA: {article.tva}%
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedArticles.some(
                        (item) => item.article_id === article.id
                      ) ? (
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
                );
              })}
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
                              <div
                                className="table-responsive"
                                style={{ maxHeight: "500px", overflow: "auto" }}
                              >
                                <Table className="table table-hover mb-0">
                                  <thead
                                    className="table-dark"
                                    style={{
                                      position: "sticky",
                                      top: 0,
                                      zIndex: 10,
                                    }}
                                  >
                                    <tr>
                                      <th
                                        style={{
                                          width: "25%",
                                          minWidth: "200px",
                                        }}
                                      >
                                        Article
                                      </th>
                                      <th
                                        style={{
                                          width: "10%",
                                          minWidth: "100px",
                                        }}
                                      >
                                        Référence
                                      </th>
                                      <th
                                        style={{
                                          width: "8%",
                                          minWidth: "80px",
                                        }}
                                      >
                                        Quantité
                                      </th>
                                      <th
                                        style={{
                                          width: "12%",
                                          minWidth: "120px",
                                        }}
                                      >
                                        Prix Unitaire HT
                                      </th>
                                      <th
                                        style={{
                                          width: "12%",
                                          minWidth: "120px",
                                        }}
                                      >
                                        Prix Unitaire TTC
                                      </th>
                                      <th
                                        style={{
                                          width: "8%",
                                          minWidth: "80px",
                                        }}
                                      >
                                        TVA (%)
                                      </th>
                                      <th
                                        style={{
                                          width: "8%",
                                          minWidth: "80px",
                                        }}
                                      >
                                        Remise (%)
                                      </th>
                                      <th
                                        style={{
                                          width: "10%",
                                          minWidth: "100px",
                                        }}
                                      >
                                        Total HT
                                      </th>
                                      <th
                                        style={{
                                          width: "10%",
                                          minWidth: "100px",
                                        }}
                                      >
                                        Total TTC
                                      </th>
                                      <th
                                        style={{
                                          width: "5%",
                                          minWidth: "60px",
                                        }}
                                      >
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedArticles.map((item, index) => {
                                      const article =
                                        articles.find(
                                          (a) => a.id === item.article_id
                                        ) || item.articleDetails;

                                      const qty =
                                        item.quantite === ""
                                          ? 0
                                          : Number(item.quantite) || 0;
                                      const priceHT =
                                        Number(item.prixUnitaire) || 0;
                                      const priceTTC =
                                        Number(item.prixTTC) || 0;
                                      const tvaRate = Number(item.tva) || 0;
                                      const remiseRate =
                                        Number(item.remise) || 0;

                                      const montantHTLigne = (
                                        qty *
                                        priceHT *
                                        (1 - remiseRate / 100)
                                      ).toFixed(3);
                                      const montantTTCLigne = (
                                        qty * priceTTC
                                      ).toFixed(3);

                                      return (
                                        <tr
                                          key={`${item.article_id}-${index}`}
                                          className="align-middle"
                                        >
                                          <td style={{ width: "25%" }}>
                                            <div className="d-flex align-items-center">
                                              <div className="flex-grow-1">
                                                <h6 className="mb-0 fw-semibold fs-6">
                                                  {article?.designation}
                                                </h6>
                                              </div>
                                            </div>
                                          </td>
                                          <td style={{ width: "10%" }}>
                                            <Badge
                                              color="light"
                                              className="text-dark"
                                            >
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
                                                  handleArticleChange(
                                                    item.article_id,
                                                    "quantite",
                                                    ""
                                                  );
                                                } else {
                                                  const newQty = Math.max(
                                                    0,
                                                    Number(value)
                                                  );
                                                  handleArticleChange(
                                                    item.article_id,
                                                    "quantite",
                                                    newQty
                                                  );
                                                }
                                              }}
                                              className="table-input text-center"
                                              style={{
                                                width: "100%",
                                                fontSize: "0.9rem",
                                              }}
                                            />
                                          </td>
                                          <td style={{ width: "12%" }}>
                                            <Input
                                              type="text"
                                              value={
                                                editingHT[item.article_id] !==
                                                undefined
                                                  ? editingHT[item.article_id]
                                                  : formatForDisplay(
                                                      item.prixUnitaire
                                                    )
                                              }
                                              onChange={(e) => {
                                                let value = e.target.value;
                                                if (
                                                  value === "" ||
                                                  /^[0-9]*[,.]?[0-9]*$/.test(
                                                    value
                                                  )
                                                ) {
                                                  value = value.replace(
                                                    ".",
                                                    ","
                                                  );
                                                  const commaCount = (
                                                    value.match(/,/g) || []
                                                  ).length;
                                                  if (commaCount <= 1) {
                                                    setEditingHT((prev) => ({
                                                      ...prev,
                                                      [item.article_id]: value,
                                                    }));
                                                    const parsed =
                                                      parseNumericInput(value);
                                                    if (
                                                      !isNaN(parsed) &&
                                                      parsed >= 0
                                                    ) {
                                                      handleArticleChange(
                                                        item.article_id,
                                                        "prixUnitaire",
                                                        parsed
                                                      );
                                                    }
                                                  }
                                                }
                                              }}
                                              onBlur={() => {
                                                setEditingHT((prev) => {
                                                  const newState = { ...prev };
                                                  delete newState[
                                                    item.article_id
                                                  ];
                                                  return newState;
                                                });
                                              }}
                                              className="table-input text-end"
                                              style={{
                                                width: "100%",
                                                fontSize: "0.9rem",
                                              }}
                                            />
                                          </td>
                                          <td style={{ width: "12%" }}>
                                            <Input
                                              type="text"
                                              value={
                                                editingTTC[item.article_id] !==
                                                undefined
                                                  ? editingTTC[item.article_id]
                                                  : formatForDisplay(
                                                      item.prixTTC
                                                    )
                                              }
                                              onChange={(e) => {
                                                let value = e.target.value;
                                                if (
                                                  value === "" ||
                                                  /^[0-9]*[,.]?[0-9]*$/.test(
                                                    value
                                                  )
                                                ) {
                                                  value = value.replace(
                                                    ".",
                                                    ","
                                                  );
                                                  const commaCount = (
                                                    value.match(/,/g) || []
                                                  ).length;
                                                  if (commaCount <= 1) {
                                                    setEditingTTC((prev) => ({
                                                      ...prev,
                                                      [item.article_id]: value,
                                                    }));
                                                    const parsed =
                                                      parseNumericInput(value);
                                                    if (
                                                      !isNaN(parsed) &&
                                                      parsed >= 0
                                                    ) {
                                                      handleArticleChange(
                                                        item.article_id,
                                                        "prixTTC",
                                                        parsed
                                                      );
                                                    }
                                                  }
                                                }
                                              }}
                                              onBlur={() => {
                                                setEditingTTC((prev) => {
                                                  const newState = { ...prev };
                                                  delete newState[
                                                    item.article_id
                                                  ];
                                                  return newState;
                                                });
                                              }}
                                              className="table-input text-end"
                                              style={{
                                                width: "100%",
                                                fontSize: "0.9rem",
                                              }}
                                            />
                                          </td>
                                          <td style={{ width: "8%" }}>
                                            <Input
                                              type="select"
                                              value={item.tva ?? ""}
                                              onChange={(e) => {
                                                const newTva =
                                                  e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value);
                                                handleArticleChange(
                                                  item.article_id,
                                                  "tva",
                                                  newTva
                                                );
                                              }}
                                              className="table-input"
                                              style={{
                                                width: "100%",
                                                fontSize: "0.9rem",
                                              }}
                                            >
                                              <option value="">
                                                Sélectionner
                                              </option>
                                              {tvaOptions.map((option) => (
                                                <option
                                                  key={option.value ?? "null"}
                                                  value={option.value ?? ""}
                                                >
                                                  {option.label}
                                                </option>
                                              ))}
                                            </Input>
                                          </td>
                                          <td style={{ width: "8%" }}>
                                            <Input
                                              type="number"
                                              min="0"
                                              max="100"
                                              value={item.remise ?? 0}
                                              onChange={(e) =>
                                                handleArticleChange(
                                                  item.article_id,
                                                  "remise",
                                                  Number(e.target.value)
                                                )
                                              }
                                              className="table-input text-center"
                                              style={{
                                                width: "100%",
                                                fontSize: "0.9rem",
                                              }}
                                            />
                                          </td>
                                          <td
                                            style={{ width: "10%" }}
                                            className="text-end fw-semibold"
                                          >
                                            {montantHTLigne} DT
                                          </td>
                                          <td
                                            style={{ width: "10%" }}
                                            className="text-end fw-semibold text-primary"
                                          >
                                            {montantTTCLigne} DT
                                          </td>
                                          <td style={{ width: "5%" }}>
                                            <Button
                                              color="danger"
                                              size="sm"
                                              onClick={() =>
                                                handleRemoveArticle(
                                                  item.article_id
                                                )
                                              }
                                              className="btn-invoice-danger"
                                              style={{
                                                padding: "0.25rem 0.5rem",
                                                fontSize: "0.8rem",
                                              }}
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
                          {selectedArticles.length > 0 && (
                            <div className="calculation-summary mt-4">
                              <h6 className="fw-semibold mb-3 text-primary">
                                <i className="ri-calculator-line me-2"></i>
                                Récapitulatif
                              </h6>

                              <Row>
                                {/* Left Side - Remise Global with proper styling */}
                                <Col md={6}>
                                  <div className="remise-global-section h-100">
                                    <h6 className="fw-semibold">
                                      <i className="ri-coupon-line me-2"></i>
                                      Remise Globale
                                    </h6>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                      <Label className="form-label fw-semibold mb-0">
                                        Activer remise
                                      </Label>
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
                                          <Label className="form-label fw-semibold">
                                            Type de remise
                                          </Label>
                                          <Input
                                            type="select"
                                            value={remiseType}
                                            onChange={(e) =>
                                              setRemiseType(
                                                e.target.value as
                                                  | "percentage"
                                                  | "fixed"
                                              )
                                            }
                                            className="form-control-sm"
                                          >
                                            <option value="percentage">
                                              Pourcentage (%)
                                            </option>
                                            <option value="fixed">
                                              Montant fixe (DT)
                                            </option>
                                          </Input>
                                        </div>
                                        <div className="col-12">
                                          <Label className="form-label fw-semibold">
                                            {remiseType === "percentage"
                                              ? "Pourcentage"
                                              : "Montant (DT)"}
                                          </Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            step={
                                              remiseType === "percentage"
                                                ? "1"
                                                : "0.001"
                                            }
                                            value={
                                              globalRemise === 0
                                                ? ""
                                                : globalRemise
                                            }
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              if (value === "") {
                                                setGlobalRemise(0);
                                              } else {
                                                const numValue = Number(value);
                                                if (
                                                  !isNaN(numValue) &&
                                                  numValue >= 0
                                                ) {
                                                  setGlobalRemise(numValue);
                                                }
                                              }
                                            }}
                                            placeholder={
                                              remiseType === "percentage"
                                                ? "0-100%"
                                                : "Montant"
                                            }
                                            className="form-control-sm"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </Col>

                                {/* Right Side - Calculations with proper spacing */}
                                <Col md={6}>
                                  <div className="calculation-summary-right">
                                    <Table className="table table-borderless mb-0">
                                      <tbody>
                                        <tr className="real-time-update">
                                          <th className="text-end text-muted fs-6">
                                            Sous-total H.T.:
                                          </th>
                                          <td className="text-end fw-semibold fs-6">
                                            {sousTotalHT.toFixed(3)} DT
                                          </td>
                                        </tr>
                                        <tr className="real-time-update">
                                          <th className="text-end text-muted fs-6">
                                            Net H.T.:
                                          </th>
                                          <td className="text-end fw-semibold fs-6">
                                            {netHT.toFixed(3)} DT
                                          </td>
                                        </tr>
                                        <tr className="real-time-update">
                                          <th className="text-end text-muted fs-6">
                                            TVA:
                                          </th>
                                          <td className="text-end fw-semibold fs-6">
                                            {totalTax.toFixed(3)} DT
                                          </td>
                                        </tr>
                                        <tr className="real-time-update">
                                          <th className="text-end text-muted fs-6">
                                            Total TTC:
                                          </th>
                                          <td className="text-end fw-semibold fs-6 text-dark">
                                            {grandTotal.toFixed(3)} DT
                                          </td>
                                        </tr>
                                        {showRemise && globalRemise > 0 && (
                                          <tr className="real-time-update">
                                            <th className="text-end text-muted fs-6">
                                              {remiseType === "percentage"
                                                ? `Remise (${globalRemise}%)`
                                                : `Remise (Montant fixe) ${(
                                                    (discountAmount / netHT) *
                                                    100
                                                  ).toFixed(1)}%`}
                                            </th>
                                            <td className="text-end text-danger fw-bold fs-6">
                                              - {discountAmount.toFixed(3)} DT
                                            </td>
                                          </tr>
                                        )}
                                        <tr className="final-total real-time-update border-top">
                                          <th className="text-end fs-5">
                                            NET À PAYER:
                                          </th>
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

                      {/* Payment Method Section */}
                      {/* Payment Method Section */}
                      <Card className="border-0 shadow-sm mb-4">
                        <CardBody className="p-4">
                          {/* Chèque - Show number and bank on same line */}
                          {modeReglement === "cheque" && (
                            <Row>
                              <Col md={6}>
                                <div className="mb-3">
                                  <Label className="form-label-lg fw-semibold">
                                    Numéro Chèque*
                                  </Label>
                                  <Input
                                    type="text"
                                    name="numeroReglement"
                                    value={numeroReglement}
                                    onChange={(e) =>
                                      setNumeroReglement(e.target.value)
                                    }
                                    onBlur={validation.handleBlur}
                                    invalid={
                                      validation.touched.numeroReglement &&
                                      !!validation.errors.numeroReglement
                                    }
                                    placeholder="Numéro du chèque"
                                    className="form-control-lg"
                                  />
                                  <FormFeedback>
                                    {validation.errors.numeroReglement}
                                  </FormFeedback>
                                </div>
                              </Col>
                              <Col md={6}>
                                <div className="mb-3">
                                  <Label className="form-label-lg fw-semibold">
                                    Banque*
                                  </Label>
                                  <Input
                                    type="text"
                                    name="banqueCheque"
                                    value={banqueCheque}
                                    onChange={(e) =>
                                      setBanqueCheque(e.target.value)
                                    }
                                    onBlur={validation.handleBlur}
                                    invalid={
                                      validation.touched.banqueCheque &&
                                      !!validation.errors.banqueCheque
                                    }
                                    placeholder="Nom de la banque"
                                    className="form-control-lg"
                                  />
                                  <FormFeedback>
                                    {validation.errors.banqueCheque}
                                  </FormFeedback>
                                </div>
                              </Col>
                            </Row>
                          )}

                          {/* Traite - Show number and due date on same line */}
                          {/* Traite - Show number and due date on same line */}
                          {modeReglement === "traite" && (
                            <Row>
                              <Col md={6}>
                                <div className="mb-3">
                                  <Label className="form-label-lg fw-semibold">
                                    Numéro Traite*
                                  </Label>
                                  <Input
                                    type="text"
                                    name="numeroReglement"
                                    value={numeroReglement}
                                    onChange={(e) =>
                                      setNumeroReglement(e.target.value)
                                    }
                                    onBlur={validation.handleBlur}
                                    invalid={
                                      validation.touched.numeroReglement &&
                                      !!validation.errors.numeroReglement
                                    }
                                    placeholder="Numéro de la traite"
                                    className="form-control-lg"
                                  />
                                  {validation.touched.numeroReglement &&
                                    validation.errors.numeroReglement && (
                                      <div className="text-danger mt-1 small">
                                        {
                                          validation.errors
                                            .numeroReglement as string
                                        }
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col md={6}>
                                <div className="mb-3">
                                  <Label className="form-label-lg fw-semibold">
                                    Date d'Échéance*
                                  </Label>
                                  <Input
                                    type="date"
                                    name="dateEcheance"
                                    value={dateEcheance}
                                    onChange={(e) =>
                                      setDateEcheance(e.target.value)
                                    }
                                    onBlur={validation.handleBlur}
                                    invalid={
                                      validation.touched.dateEcheance &&
                                      !!validation.errors.dateEcheance
                                    }
                                    className="form-control-lg"
                                  />
                                  {validation.touched.dateEcheance &&
                                    validation.errors.dateEcheance && (
                                      <div className="text-danger mt-1 small">
                                        {
                                          validation.errors
                                            .dateEcheance as string
                                        }
                                      </div>
                                    )}
                                </div>
                              </Col>
                            </Row>
                          )}

                          {/* Virement - No input needed */}

                          {/* Espace / Notes  <div className="mb-3">
                            <Label className="form-label-lg fw-semibold">
                              Notes Paiement
                            </Label>
                            <Input
                              type="textarea"
                              name="espaceNotes"
                              value={espaceNotes}
                              onChange={(e) => setEspaceNotes(e.target.value)}
                              placeholder="Notes supplémentaires sur le paiement..."
                              rows="2"
                              className="form-control-lg"
                            />
                          </div> */}
                          {/* In your detail modal payment section */}
                          {/* Enhanced Payment Method Section */}
                          {/* Simple Payment Method Section */}
                          {/* Simple Payment Method Section */}
                          <Card className="border-0 shadow-sm mb-4">
                            <CardBody className="p-4">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="fw-semibold text-primary mb-0">
                                  <i className="ri-bank-card-line me-2"></i>
                                  Modes de Règlement
                                </h5>

                                <Button
                                  color="primary"
                                  size="sm"
                                  onClick={addPaymentMethod}
                                  className="btn-invoice-primary"
                                >
                                  <i className="ri-add-line me-1"></i>
                                  Ajouter Paiement
                                </Button>
                              </div>

                              {/* Payment Methods List */}
                              {paymentMethods.map((payment, index) => (
                                <div
                                  key={payment.id}
                                  className="border rounded p-3 mb-3 bg-light"
                                >
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-semibold mb-0 text-dark">
                                      Paiement #{index + 1}
                                    </h6>

                                    {paymentMethods.length > 1 && (
                                      <Button
                                        color="danger"
                                        size="sm"
                                        onClick={() =>
                                          removePaymentMethod(payment.id)
                                        }
                                        className="btn-invoice-danger"
                                      >
                                        <i className="ri-close-line"></i>
                                      </Button>
                                    )}
                                  </div>

                                  <Row className="g-3">
                                    {/* Method Type */}
                                    <Col
                                      md={paymentMethods.length === 1 ? 12 : 3}
                                    >
                                      <Label className="form-label fw-semibold">
                                        Type
                                      </Label>
                                      <Input
                                        type="select"
                                        value={payment.method}
                                        onChange={(e) =>
                                          updatePaymentMethod(
                                            payment.id,
                                            "method",
                                            e.target.value
                                          )
                                        }
                                        className="form-control"
                                      >
                                        <option value="especes">Espèces</option>
                                        <option value="cheque">Chèque</option>
                                        <option value="virement">
                                          Virement
                                        </option>
                                        <option value="traite">Traite</option>
                                        <option value="tpe">Carte Bancaire "TPE"</option> {/* ADD THIS */}

                                      </Input>
                                    </Col>

                                    {/* Montant - Only show when multiple payment methods */}
                                    {paymentMethods.length > 1 && (
                                      <Col md={3}>
                                        <Label className="form-label fw-semibold">
                                          Montant (DT)
                                        </Label>
                                        <Input
                                          type="number"
                                          step="0.001"
                                          min="0"
                                          value={
                                            payment.amount === 0
                                              ? ""
                                              : payment.amount
                                          }
                                          onChange={(e) => {
                                            const value =
                                              e.target.value === ""
                                                ? 0
                                                : Number(e.target.value);
                                            updatePaymentMethod(
                                              payment.id,
                                              "amount",
                                              value
                                            );
                                          }}
                                          placeholder="0.000"
                                          className="form-control"
                                        />
                                      </Col>
                                    )}

                                    {/* Numéro - Only for cheque and traite */}
                                    {(payment.method === "cheque" ||
                                      payment.method === "traite") && (
                                      <Col
                                        md={paymentMethods.length === 1 ? 6 : 3}
                                      >
                                        <Label className="form-label fw-semibold">
                                          {payment.method === "cheque"
                                            ? "Numéro Chèque"
                                            : "Numéro Traite"}
                                        </Label>
                                        <Input
                                          type="text"
                                          value={payment.numero || ""}
                                          onChange={(e) =>
                                            updatePaymentMethod(
                                              payment.id,
                                              "numero",
                                              e.target.value
                                            )
                                          }
                                          placeholder={
                                            payment.method === "cheque"
                                              ? "N° chèque"
                                              : "N° traite"
                                          }
                                          className="form-control"
                                        />
                                      </Col>
                                    )}

                                    {/* Banque - Only for cheque */}
                                    {payment.method === "cheque" && (
                                      <Col
                                        md={paymentMethods.length === 1 ? 6 : 3}
                                      >
                                        <Label className="form-label fw-semibold">
                                          Banque
                                        </Label>
                                        <Input
                                          type="text"
                                          value={payment.banque || ""}
                                          onChange={(e) =>
                                            updatePaymentMethod(
                                              payment.id,
                                              "banque",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Nom banque"
                                          className="form-control"
                                        />
                                      </Col>
                                    )}

                                    {/* Date Échéance - Only for traite */}
                                    {payment.method === "traite" && (
                                      <Col
                                        md={paymentMethods.length === 1 ? 6 : 3}
                                      >
                                        <Label className="form-label fw-semibold">
                                          Date Échéance
                                        </Label>
                                        <Input
                                          type="date"
                                          value={
                                            payment.dateEcheance ||
                                            moment().format("YYYY-MM-DD")
                                          }
                                          onChange={(e) =>
                                            updatePaymentMethod(
                                              payment.id,
                                              "dateEcheance",
                                              e.target.value
                                            )
                                          }
                                          className="form-control"
                                        />
                                      </Col>
                                    )}
                                  </Row>

                                  {/* Auto-set amount to finalTotal when only one payment method */}
                                  {paymentMethods.length === 1 && (
                                    <div className="mt-2">
                                      <small className="text-muted">
                                        <i className="ri-information-line me-1"></i>
                                        Montant automatiquement défini à:{" "}
                                        <strong>
                                          {finalTotal.toFixed(3)} DT
                                        </strong>
                                      </small>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Payment Summary - Only show when multiple payment methods */}
                              {paymentMethods.length > 1 && (
                                <Card
                                  className={
                                    isPaymentTotalValid
                                      ? "border-success bg-success bg-opacity-10"
                                      : "border-warning bg-warning bg-opacity-10"
                                  }
                                >
                                  <CardBody className="p-3">
                                    <Row className="align-items-center">
                                      <Col md={8}>
                                        <div className="d-flex justify-content-between">
                                          <span className="fw-semibold">
                                            Total des Paiements:
                                          </span>
                                          <span className="fw-bold fs-5">
                                            {totalPaymentAmount.toFixed(3)} DT
                                          </span>
                                        </div>
                                        <div className="d-flex justify-content-between mt-1">
                                          <span className="fw-semibold">
                                            Montant à Payer:
                                          </span>
                                          <span className="fw-bold fs-5">
                                            {finalTotal.toFixed(3)} DT
                                          </span>
                                        </div>
                                      </Col>
                                      <Col md={4}>
                                        <div className="text-end">
                                          {isPaymentTotalValid ? (
                                            <Badge
                                              color="success"
                                              className="fs-6"
                                            >
                                              <i className="ri-check-line me-1"></i>
                                              Équilibré
                                            </Badge>
                                          ) : (
                                            <Badge
                                              color="warning"
                                              className="fs-6"
                                            >
                                              <i className="ri-error-warning-line me-1"></i>
                                              Différence:{" "}
                                              {(
                                                totalPaymentAmount - finalTotal
                                              ).toFixed(3)}{" "}
                                              DT
                                            </Badge>
                                          )}
                                        </div>
                                      </Col>
                                    </Row>
                                  </CardBody>
                                </Card>
                              )}
                            </CardBody>
                          </Card>
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
                            <Label className="form-label-lg fw-semibold">
                              Notes
                            </Label>
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
                        disabled={
                          selectedArticles.length === 0 || !selectedClient
                        }
                      >
                        <i className="ri-save-line me-2"></i>
                        {isEdit ? "Modifier" : "Enregistrer"}
                      </Button>
                    </ModalFooter>
                  </Form>
                </Modal>

                {/* Quick Client Creation Modal */}
                <Modal
                  isOpen={clientModal}
                  toggle={() => setClientModal(false)}
                  centered
                  size="lg"
                >
                  <ModalHeader toggle={() => setClientModal(false)}>
                    Nouveau Client
                  </ModalHeader>
                  <ModalBody>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Raison Sociale</Label>
                          <Input
                            value={newClient.raison_sociale}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                raison_sociale: e.target.value,
                              })
                            }
                            placeholder="Raison sociale"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Désignation</Label>
                          <Input
                            value={newClient.designation}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                designation: e.target.value,
                              })
                            }
                            placeholder="Désignation"
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Matricule Fiscal</Label>
                          <Input
                            value={newClient.matricule_fiscal}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                matricule_fiscal: e.target.value,
                              })
                            }
                            placeholder="Matricule fiscal"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Registre Commerce</Label>
                          <Input
                            value={newClient.register_commerce}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                register_commerce: e.target.value,
                              })
                            }
                            placeholder="Registre de commerce"
                          />
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <Label>Adresse</Label>
                      <Input
                        value={newClient.adresse}
                        onChange={(e) =>
                          setNewClient({
                            ...newClient,
                            adresse: e.target.value,
                          })
                        }
                        placeholder="Adresse"
                      />
                    </div>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Ville</Label>
                          <Input
                            value={newClient.ville}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                ville: e.target.value,
                              })
                            }
                            placeholder="Ville"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Code Postal</Label>
                          <Input
                            value={newClient.code_postal}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                code_postal: e.target.value,
                              })
                            }
                            placeholder="Code postal"
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Téléphone 1</Label>
                          <Input
                            value={newClient.telephone1}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                telephone1: e.target.value,
                              })
                            }
                            placeholder="Téléphone 1"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Téléphone 2</Label>
                          <Input
                            value={newClient.telephone2}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                telephone2: e.target.value,
                              })
                            }
                            placeholder="Téléphone 2"
                          />
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newClient.email}
                        onChange={(e) =>
                          setNewClient({ ...newClient, email: e.target.value })
                        }
                        placeholder="Email"
                      />
                    </div>
                  </ModalBody>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setClientModal(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleCreateClient}
                    >
                      Créer Client
                    </button>
                  </div>
                </Modal>

                {/* Quick Article Creation Modal */}
                {/* Quick Article Creation Modal */}
                <Modal
                  isOpen={articleModal}
                  toggle={() => setArticleModal(false)}
                  centered
                  size="xl"
                >
                  <ModalHeader toggle={() => setArticleModal(false)}>
                    <div className="d-flex align-items-center">
                      <div className="modal-icon-wrapper bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="ri-add-box-line text-primary fs-4"></i>
                      </div>
                      <div>
                        <h4 className="mb-0 fw-bold text-dark">
                          Nouvel Article Rapide
                        </h4>
                        <small className="text-muted">
                          Créer un nouvel article rapidement
                        </small>
                      </div>
                    </div>
                  </ModalHeader>
                  <ModalBody>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">Référence</Label>
                          <Input
                            value={newArticle.reference}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                reference: e.target.value,
                              })
                            }
                            placeholder="Référence article"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">Nom</Label>
                          <Input
                            value={newArticle.nom}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                nom: e.target.value,
                              })
                            }
                            placeholder="Nom de l'article"
                          />
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <Label className="form-label">Désignation</Label>
                      <Input
                        value={newArticle.designation}
                        onChange={(e) =>
                          setNewArticle({
                            ...newArticle,
                            designation: e.target.value,
                          })
                        }
                        placeholder="Désignation complète"
                      />
                    </div>

                    {/* Categories */}
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">
                            Famille Principale
                          </Label>
                          <Input
                            type="select"
                            value={newArticle.categorie_id}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                categorie_id: e.target.value,
                              })
                            }
                          >
                            <option value="">Sélectionner une famille</option>
                            {categories
                              .filter((cat) => !cat.parent_id)
                              .map((categorie) => (
                                <option key={categorie.id} value={categorie.id}>
                                  {categorie.nom}
                                </option>
                              ))}
                          </Input>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">Sous-Famille</Label>
                          <Input
                            type="select"
                            value={newArticle.sous_categorie_id}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                sous_categorie_id: e.target.value,
                              })
                            }
                            disabled={!newArticle.categorie_id}
                          >
                            <option value="">
                              Sélectionner une sous-famille
                            </option>
                            {subcategories.map((subcategorie) => (
                              <option
                                key={subcategorie.id}
                                value={subcategorie.id}
                              >
                                {subcategorie.nom}
                              </option>
                            ))}
                          </Input>
                          {!newArticle.categorie_id && (
                            <small className="text-muted">
                              Sélectionnez d'abord une famille principale
                            </small>
                          )}
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">Fournisseur</Label>
                          <Input
                            type="select"
                            value={newArticle.fournisseur_id}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                fournisseur_id: e.target.value,
                              })
                            }
                          >
                            <option value="">
                              Sélectionner un fournisseur
                            </option>
                            {fournisseurs.map((fournisseur) => (
                              <option
                                key={fournisseur.id}
                                value={fournisseur.id}
                              >
                                {fournisseur.raison_sociale}
                              </option>
                            ))}
                          </Input>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">Type</Label>
                          <Input
                            type="select"
                            value={newArticle.type}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                type: e.target.value as
                                  | "Consigné"
                                  | "Non Consigné",
                              })
                            }
                          >
                            <option value="Non Consigné">Non Consigné</option>
                            <option value="Consigné">Consigné</option>
                          </Input>
                        </div>
                      </Col>
                    </Row>

                    {/* Pricing Section */}
                    <h6 className="fw-semibold mb-3 text-primary">
                      Prix et Taxes
                    </h6>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">Prix d'achat HT</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={newArticle.pua_ht}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                pua_ht: Number(e.target.value),
                              })
                            }
                            placeholder="0.000"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">Prix d'achat TTC</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={newArticle.pua_ttc}
                            readOnly
                            className="bg-light"
                            placeholder="Calculé automatiquement"
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">Prix de vente HT</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={newArticle.puv_ht}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                puv_ht: Number(e.target.value),
                              })
                            }
                            placeholder="0.000"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">
                            Prix de vente TTC
                          </Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={newArticle.puv_ttc}
                            readOnly
                            className="bg-light"
                            placeholder="Calculé automatiquement"
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">
                            Quantité en stock
                          </Label>
                          <Input
                            type="number"
                            value={newArticle.qte}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                qte: Number(e.target.value),
                              })
                            }
                            placeholder="0"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">TVA (%)</Label>
                          <Input
                            type="number"
                            value={newArticle.tva}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                tva: Number(e.target.value),
                              })
                            }
                            placeholder="0"
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="form-label">Remise (%)</Label>
                          <Input
                            type="number"
                            value={newArticle.remise}
                            onChange={(e) =>
                              setNewArticle({
                                ...newArticle,
                                remise: Number(e.target.value),
                              })
                            }
                            placeholder="0"
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3 d-flex align-items-end">
                          <div className="form-check form-switch">
                            <Input
                              type="checkbox"
                              checked={newArticle.taux_fodec}
                              onChange={(e) =>
                                setNewArticle({
                                  ...newArticle,
                                  taux_fodec: e.target.checked,
                                })
                              }
                              className="form-check-input"
                            />
                            <Label
                              check
                              className="form-check-label fw-semibold"
                            >
                              Taux FODEC (1%)
                            </Label>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Website Settings */}
                  </ModalBody>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setArticleModal(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleCreateArticle}
                    >
                      <i className="ri-add-line me-2"></i>
                      Créer Article
                    </button>
                  </div>
                </Modal>

                <VenteComptoirePDFModal
                  isOpen={pdfModal}
                  toggle={() => setPdfModal(false)}
                  bonCommande={selectedBonCommandeForPdf}
                  companyInfo={companyInfo}
                  pdfType={pdfType}
                />

                <ToastContainer />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VenteComptoire;
