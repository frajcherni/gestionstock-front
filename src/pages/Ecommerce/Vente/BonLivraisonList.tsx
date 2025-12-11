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
  FetchBonLivraison,
  createBonLivraison,
  updateBonLivraison,
  deleteBonLivraison,
  fetchNextLivraisonNumberAPI,
} from "../../../Components/CommandeClient/BonLivraisonServices";
import {
  fetchArticles,
  fetchClients,
  fetchVendeurs,
} from "../../../Components/Article/ArticleServices";
import {
  createFacture,
  fetchNextFactureNumberFromAPI,
} from "./FactureClientServices";
import {
  Article,
  Client,
  Vendeur,
  BonCommandeClient,
  BonLivraison,
} from "../../../Components/Article/Interfaces";
import { fetchBonsCommandeClient } from "../../../Components/CommandeClient/CommandeClientServices";
import classnames from "classnames";
import BonLivraisonPDFModal from "./BonLivraisonPDFModal";
import { useProfile } from "Components/Hooks/UserHooks";
import logo from "../../../assets/images/imglogo.png";

// Add these imports if not already present
import {
  createClient,
  createArticle,
  fetchFournisseurs,
  fetchCategories,
} from "../../../Components/Article/ArticleServices";
import { Categorie, Fournisseur } from "../../../Components/Article/Interfaces";

const BonLivraisonList = () => {
  const [detailModal, setDetailModal] = useState(false);
  const [selectedBonLivraison, setSelectedBonLivraison] =
    useState<BonLivraison | null>(null);
  const [taxMode, setTaxMode] = useState<"HT" | "TTC">("HT");
  const [activeTab, setActiveTab] = useState("1");
  const [modal, setModal] = useState(false);
  const [bonsLivraison, setBonsLivraison] = useState<BonLivraison[]>([]);
  const [filteredBonsLivraison, setFilteredBonsLivraison] = useState<
    BonLivraison[]
  >([]);
  const [bonLivraison, setBonLivraison] = useState<BonLivraison | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [bonsCommande, setBonsCommande] = useState<BonCommandeClient[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isCreatingFacture, setIsCreatingFacture] = useState(false);
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
  const [nextNumeroLivraison, setNextNumeroLivraison] = useState("");
  const [nextNumeroFacture, setNextNumeroFacture] = useState("");
  const [selectedBonCommande, setSelectedBonCommande] =
    useState<BonCommandeClient | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<
    {
      article_id: number;
      quantite: number | "";
      prixUnitaire: number;
      prixTTC: number; // Add this
      tva?: number | null;
      remise?: number | null;
      articleDetails?: Article;
    }[]
  >([]);
  const [remiseType, setRemiseType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [globalRemise, setGlobalRemise] = useState(0);
  const [timbreFiscal, setTimbreFiscal] = useState<boolean>(false);
  const [editingTTC, setEditingTTC] = useState<{ [key: number]: string }>({});
  const [editingHT, setEditingHT] = useState<{ [key: number]: string }>({});

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null);
  const [itemRefs, setItemRefs] = useState<React.RefObject<HTMLLIElement>[]>(
    []
  );

  // Add these with your other state declarations at the top of the component
  const [valorisationModal, setValorisationModal] = useState(false);
  const [
    selectedBonLivraisonForValorisation,
    setSelectedBonLivraisonForValorisation,
  ] = useState<BonLivraison | null>(null);
  const [isValorise, setIsValorise] = useState(true);

  // Add these state variables near your existing states
  const [clientModal, setClientModal] = useState(false);
  const [articleModal, setArticleModal] = useState(false);
  // Add with your other state declarations
  const [livraisonInfo, setLivraisonInfo] = useState({
    voiture: "",
    serie: "",
    chauffeur: "",
    cin: "",
  });
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
    status: "Actif" as "Actif" | "Inactif",
  });

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

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [subcategories, setSubcategories] = useState<Categorie[]>([]);

  const tvaOptions = [
    { value: null, label: "Non applicable" },
    { value: 0, label: "0% (Exonéré)" },
    { value: 7, label: "7%" },
    { value: 10, label: "10%" },
    { value: 13, label: "13%" },
    { value: 19, label: "19%" },
    { value: 21, label: "21%" },
  ];

  const conditionPaiementOptions = [
    { value: "7", label: "7 jours" },
    { value: "15", label: "15 jours" },
    { value: "30", label: "30 jours" },
    { value: "60", label: "60 jours" },
    { value: "90", label: "90 jours" },
  ];

  const [pdfModal, setPdfModal] = useState(false);
  const [selectedBonLivraisonForPdf, setSelectedBonLivraisonForPdf] =
    useState<BonLivraison | null>(null);
  const { userProfile, loading: profileLoading } = useProfile();

  // Company info for PDF
  const companyInfo = useMemo(
    () => ({
      name: userProfile?.company_name || "Votre Société",
      address: userProfile?.company_address || "Adresse",
      city: userProfile?.company_city || "Ville",
      phone: userProfile?.company_phone || "Téléphone",
      email: userProfile?.company_email || "Email",
      website: userProfile?.company_website || "Site web",
      taxId: userProfile?.company_tax_id || "MF",
      gsm: userProfile?.company_gsm,
      logo: logo,
    }),
    [userProfile]
  );

  // Function to open PDF modal
  // Replace your current openPdfModal function with this:
  const openPdfModal = (bonLivraison: BonLivraison) => {
    setSelectedBonLivraisonForValorisation(bonLivraison);
    setValorisationModal(true);
    setIsValorise(true); // Reset to default value
  };

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
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
        setFilteredArticles([]);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
        setFilteredArticles([]);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const fetchNextLivraisonNumberFromAPI = useCallback(async () => {
    console.log("🔍 fetchNextLivraisonNumberFromAPI called");

    try {
      console.log("📦 Making API call...");
      const numero = await fetchNextLivraisonNumberAPI();
      console.log("✅ Received numero:", numero);

      if (!numero || typeof numero !== "string") {
        throw new Error("Invalid number format received from API");
      }

      setNextNumeroLivraison(numero);
      return numero;
    } catch (err) {
      console.error("❌ Error fetching next livraison number:", err);

      // Show user-friendly error
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(
        `Échec de la récupération du numéro de livraison: ${errorMessage}`
      );

      // Fallback: Generate a number locally
      const year = moment().format("YYYY");
      const nextNum = `LIVRAISON-${String(350 + bonsLivraison.length).padStart(
        3,
        "0"
      )}/${year}`;
      console.log("🔄 Using fallback number:", nextNum);
      setNextNumeroLivraison(nextNum);
      return nextNum;
    }
  }, [bonsLivraison]);
  const fetchNextFactureNumber = useCallback(async () => {
    try {
      const numero = await fetchNextFactureNumberFromAPI();
      setNextNumeroFacture(numero);
    } catch (err) {
      toast.error("Échec de la récupération du numéro de facture");
      const year = moment().format("YYYY");
      const nextNum = `FAC-${String(bonsLivraison.length + 1).padStart(
        4,
        "0"
      )}/${year}`;
      setNextNumeroFacture(nextNum);
    }
  }, [bonsLivraison]);

  useEffect(() => {
    if (modal && !isEdit) {
      if (isCreatingFacture) {
        fetchNextFactureNumber();
      } else {
        fetchNextLivraisonNumberFromAPI();
      }
    }
  }, [
    modal,
    isEdit,
    isCreatingFacture,
    fetchNextLivraisonNumberFromAPI,
    fetchNextFactureNumber,
  ]);

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

  // Phone formatting functions - add these near the top of your component
  const formatPhoneInput = (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // Limit to 8 digits (Tunisian phone number length)
    const limited = cleaned.slice(0, 8);

    // Format as XX XXX XXX
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 5) {
      return `${limited.substring(0, 2)} ${limited.substring(2)}`;
    } else {
      return `${limited.substring(0, 2)} ${limited.substring(
        2,
        5
      )} ${limited.substring(5, 8)}`;
    }
  };

  // Display formatting function
  const formatPhoneDisplay = (phone: string | null | undefined): string => {
    if (!phone) return "N/A";

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 8) {
      return `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(
        2,
        5
      )} ${cleanPhone.substring(5, 8)}`;
    }
    return phone;
  };

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
        livraisonData,
        clientsData,
        vendeursData,
        articlesData,
        commandesData,
        categoriesData,
        fournisseursData,
      ] = await Promise.all([
        FetchBonLivraison(),
        fetchClients(),
        fetchVendeurs(),
        fetchArticles(),
        fetchBonsCommandeClient(),
        fetchCategories(),
        fetchFournisseurs(),
      ]);

      setBonsLivraison(livraisonData);
      setFilteredBonsLivraison(livraisonData);
      setClients(clientsData);
      setVendeurs(vendeursData);
      setCategories(categoriesData);
      setFournisseurs(fournisseursData);
      setArticles(articlesData);
      setBonsCommande(commandesData);

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
    let result = [...bonsLivraison];

    if (activeTab === "2") {
      result = result.filter((bon) => bon.status === "Brouillon");
    } else if (activeTab === "3") {
      result = result.filter((bon) => bon.status === "Livree");
    } else if (activeTab === "4") {
      result = result.filter((bon) => bon.status === "Partiellement Livree");
    } else if (activeTab === "5") {
      result = result.filter((bon) => bon.status === "Annulee");
    }

    if (startDate && endDate) {
      const start = moment(startDate).startOf("day");
      const end = moment(endDate).endOf("day");
      result = result.filter((bon) => {
        const bonDate = moment(bon.dateLivraison);
        return bonDate.isBetween(start, end, null, "[]");
      });
    }

    // Enhanced search functionality to include phone numbers
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (bon) =>
          bon.numeroLivraison.toLowerCase().includes(searchLower) ||
          (bon.client?.raison_sociale &&
            bon.client.raison_sociale.toLowerCase().includes(searchLower)) ||
          // Search in client phone numbers
          (bon.client?.telephone1 &&
            bon.client.telephone1.toLowerCase().includes(searchLower)) ||
          (bon.client?.telephone2 &&
            bon.client.telephone2.toLowerCase().includes(searchLower)) ||
          (bon.bonCommandeClient?.numeroCommande &&
            bon.bonCommandeClient.numeroCommande
              .toLowerCase()
              .includes(searchLower))
      );
    }

    setFilteredBonsLivraison(result);
  }, [activeTab, startDate, endDate, searchText, bonsLivraison]);

  const openDetailModal = (bonLivraison: BonLivraison) => {
    setSelectedBonLivraison(bonLivraison);
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

    // Add timbre fiscal for factures
    if (isCreatingFacture && timbreFiscal) {
      finalTotalValue = Math.round((finalTotalValue + 1) * 1000) / 1000;
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
  }, [
    selectedArticles,
    showRemise,
    globalRemise,
    remiseType,
    isCreatingFacture,
    timbreFiscal,
    editingHT,
    editingTTC,
  ]);

  const handleDelete = async () => {
    if (!bonLivraison) return;

    try {
      await deleteBonLivraison(bonLivraison.id);
      setDeleteModal(false);
      fetchData();
      toast.success("Bon de livraison supprimé avec succès");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Échec de la suppression"
      );
    }
  };

  // Add these functions before the return statement
  const handleCreateClient = async () => {
    try {
      const createdClient = await createClient(newClient);
      toast.success("Client créé avec succès");
      
      // Auto-select the newly created client
      setSelectedClient(createdClient);
      validation.setFieldValue("client_id", createdClient.id);
      setClientSearch(createdClient.raison_sociale);
      
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

  // Add effect for auto-calculation in article modal
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

  // Add effect for subcategories
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

  const handleSubmit = async (values: any) => {
    try {
      const livraisonData = {
        ...values,
        taxMode,
        articles: selectedArticles.map((item) => ({
          article_id: item.article_id,
          quantite: item.quantite,
          prix_unitaire: item.prixUnitaire,
          prix_ttc: item.prixTTC, // ✅ Make sure prix_ttc is included
          tva: item.tva,
          remise: item.remise,
        })),
        remise: globalRemise,
        remiseType: remiseType,
        bonCommandeClient_id: selectedBonCommande?.id || null,
        //totalHT: subTotal,
        totalTVA: totalTax,
        totalTTC: grandTotal,
        timbreFiscal: isCreatingFacture ? timbreFiscal : false,
        livraisonInfo: livraisonInfo,
      };

      if (isCreatingFacture) {
        livraisonData.bonLivraison_id = bonLivraison?.id;
        await createFacture(livraisonData);
        console.log(livraisonData, "----------");
        toast.success("Facture créée avec succès");
      } else {
        if (isEdit && bonLivraison) {
          await updateBonLivraison(bonLivraison.id, livraisonData);
          toast.success("Bon de livraison mis à jour avec succès");
        } else {
          await createBonLivraison(livraisonData);
          toast.success("Bon de livraison créé avec succès");
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
      numeroLivraison: isEdit
        ? bonLivraison?.numeroLivraison || ""
        : nextNumeroLivraison,
      numeroFacture: isCreatingFacture ? nextNumeroFacture : "",
      dateLivraison: bonLivraison?.dateLivraison
        ? moment(bonLivraison.dateLivraison).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"),
      dateFacture: moment().format("YYYY-MM-DD"),
      //    dateEcheance: "",
      // conditionPaiement: "",
      client_id: bonLivraison?.client?.id ?? "",
      vendeur_id: bonLivraison?.vendeur?.id ?? "",
      status: bonLivraison?.status ?? "Brouillon",
      notes: bonLivraison?.notes ?? "",
      bonCommandeClient_id: bonLivraison?.bonCommandeClient?.id ?? "",
      isCreatingFacture: isCreatingFacture,
    },
    validationSchema: Yup.object({
      numeroLivraison: Yup.string().when("isCreatingFacture", {
        is: false,
        then: (schema) => schema.required("Le numéro est requis"),
      }),
      numeroFacture: Yup.string().when("isCreatingFacture", {
        is: true,
        then: (schema) => schema.required("Le numéro de facture est requis"),
      }),
      dateLivraison: Yup.date().when("isCreatingFacture", {
        is: false,
        then: (schema) =>
          schema.required("La date est requise").typeError("Date invalide"),
      }),
      dateFacture: Yup.date().when("isCreatingFacture", {
        is: true,
        then: (schema) => schema.required("La date de facture est requise"),
      }),

      client_id: Yup.number().required("Client requis"),
      vendeur_id: Yup.number().required("Vendeur requis"),
      //  status: Yup.string().required("Statut requis"),
      bonCommandeClient_id: Yup.number().nullable(),
      isCreatingFacture: Yup.boolean(),
    }),
    onSubmit: handleSubmit,
  });
  const toggleModal = useCallback(() => {
    if (modal) {
      setModal(false);
      setBonLivraison(null);
      setSelectedArticles([]);
      setGlobalRemise(0);
      setRemiseType("percentage");
      setShowRemise(false);
      setSelectedBonCommande(null);
      setSelectedClient(null);
      setNextNumeroLivraison("");
      setIsCreatingFacture(false);
      setTimbreFiscal(false);

      // ✅ FIX: Properly reset delivery info
      setLivraisonInfo({
        voiture: "",
        serie: "",
        chauffeur: "",
        cin: "",
      });

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
      // ✅ Use TTC price from article like in BC Client
      const initialHT = article.puv_ht || 0;
      const initialTVA = article.tva || 0;
      const initialTTC = article.puv_ttc || initialHT * (1 + (article.tva || 0) / 100); // Use puv_ttc if available
  
      setSelectedArticles([
        ...selectedArticles,
        {
          article_id: article.id,
          quantite: "", // Empty for user to fill
          prixUnitaire: initialHT,
          tva: initialTVA,
          remise: 0,
          prixTTC: Math.round(initialTTC * 1000) / 1000, // ✅ Use TTC from article like BC Client
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

  const StatusBadge = ({
    status,
  }: {
    status?: "Brouillon" | "Livree" | "Annulee" | "Partiellement Livree";
  }) => {
    const statusConfig = {
      Brouillon: {
        bgClass: "bg-warning",
        textClass: "text-warning",
        icon: "ri-draft-line",
      },
      Livree: {
        bgClass: "bg-success",
        textClass: "text-success",
        icon: "ri-truck-line",
      },
      Annulee: {
        bgClass: "bg-danger",
        textClass: "text-danger",
        icon: "ri-close-circle-line",
      },
      "Partiellement Livree": {
        bgClass: "bg-info",
        textClass: "text-info",
        icon: "ri-truck-line",
      },
    };

    if (!status) return null;

    const config = statusConfig[status] || statusConfig["Brouillon"];

    return (
      <span
        className={`badge ${config.bgClass}-subtle ${config.textClass} text-uppercase`}
      >
        <i className={`${config.icon} align-bottom me-1`}></i>
        {status}
      </span>
    );
  };

  const handleSelectBonCommande = (bon: BonCommandeClient) => {
    setSelectedBonCommande(bon);
    setSelectedClient(bon.client || null);
    validation.setFieldValue("client_id", bon.client?.id || "");
    validation.setFieldValue("bonCommandeClient_id", bon.id);

    setSelectedArticles(
      bon.articles.map((item) => ({
        article_id: item.article?.id || 0,
        quantite: item.quantite,
        prixUnitaire:
          typeof item.prixUnitaire === "string"
            ? parseFloat(item.prixUnitaire)
            : item.prixUnitaire,
        prixTTC:
          item.article?.puv_ttc || // Use article's TTC price
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

    setGlobalRemise(bon.remise || 0);
    setRemiseType(bon.remiseType || "percentage");
    setShowRemise((bon.remise || 0) > 0);
  };
  const columns = useMemo(
    () => [
      {
        header: "Numéro",
        accessorKey: "numeroLivraison",
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
        accessorKey: "dateLivraison",
        enableColumnFilter: false,
        cell: (cell: any) => moment(cell.getValue()).format("DD MMM YYYY"),
      },
      {
        header: "Client",
        accessorKey: "client",
        enableColumnFilter: false,
        cell: (cell: any) => `${cell.getValue()?.raison_sociale || ""}`,
      },
      {
        header: "Commande",
        accessorKey: "bonCommandeClient",
        enableColumnFilter: false,
        cell: (cell: any) => cell.getValue()?.numeroCommande || "N/A",
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
      {
        header: "Total TTC",
        accessorKey: "articles",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const total = cell.getValue().reduce((sum: number, item: any) => {
            const itemTotal = item.quantite * item.prix_unitaire;
            const itemDiscount = item.remise
              ? itemTotal * (item.remise / 100)
              : 0;
            const taxableAmount = itemTotal - itemDiscount;
            const itemTax = item.tva ? taxableAmount * (item.tva / 100) : 0;
            return sum + taxableAmount + itemTax;
          }, 0);
          return `${total.toFixed(2)} DT`;
        },
      },
      {
        header: "Total TTC Après Remise",
        accessorKey: "articles",
        enableColumnFilter: false,
        cell: (cell: any) => {
          const total = cell.getValue().reduce((sum: number, item: any) => {
            const itemTotal =
              Number(item.quantite) * Number(item.prix_unitaire);
            const itemDiscount = item.remise
              ? itemTotal * (Number(item.remise) / 100)
              : 0;
            const taxableAmount = itemTotal - itemDiscount;
            const itemTax = item.tva
              ? taxableAmount * (Number(item.tva) / 100)
              : 0;
            return sum + taxableAmount + itemTax;
          }, 0);

          const globalDiscount = Number(cell.row.original.remise) || 0;
          const discountType = cell.row.original.remiseType || "percentage";

          let netAPayer: number = total;
          if (globalDiscount > 0) {
            if (discountType === "percentage") {
              netAPayer = total * (1 - globalDiscount / 100);
            } else {
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
                    setBonLivraison(cellProps.row.original);
                    setSelectedArticles(
                      cellProps.row.original.articles.map((item: any) => ({
                        article_id: item.article.id,
                        quantite: item.quantite,
                        prixUnitaire: parseFloat(item.prix_unitaire),
                        prixTTC:
                          parseFloat(item.prix_ttc) ||
                          parseFloat(item.prix_unitaire) *
                            (1 + (item.tva || 0) / 100),
                        tva: item.tva != null ? parseFloat(item.tva) : null,
                        remise:
                          item.remise != null ? parseFloat(item.remise) : null,
                        articleDetails: item.article,
                      }))
                    );
                    setGlobalRemise(cellProps.row.original.remise || 0);
                    setRemiseType(
                      cellProps.row.original.remiseType || "percentage"
                    );
                    setShowRemise((cellProps.row.original.remise || 0) > 0);
                    // In your edit button click handler, add this:
                    const currentBonLivraison = cellProps.row.original;

                    setLivraisonInfo({
                      voiture: currentBonLivraison?.voiture || "",
                      serie: currentBonLivraison?.serie || "",
                      chauffeur: currentBonLivraison?.chauffeur || "",
                      cin: currentBonLivraison?.cin || "",
                    });

                    setSelectedBonCommande(
                      cellProps.row.original.bonCommandeClient || null
                    );
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
                    setBonLivraison(cellProps.row.original);
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
                  onClick={() => openPdfModal(cellProps.row.original)}
                >
                  <i className="ri-file-pdf-line fs-16"></i>
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
        <BreadCrumb title="Bons de Livraison" pageTitle="Livraisons" />

        <Row>
          <Col lg={12}>
            <Card id="bonLivraisonList">
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="card-title mb-0">
                      Gestion des Bons de Livraison
                    </h5>
                  </div>
                  <div className="col-sm-auto">
                    <div className="d-flex gap-1 flex-wrap">
                      <Button
                        color="primary"
                        onClick={() => {
                          setIsEdit(false);
                          setBonLivraison(null);
                          setSelectedBonCommande(null);
                          setSelectedClient(null);
                          setSelectedArticles([]);
                          setIsCreatingFacture(false);
                          toggleModal();
                        }}
                      >
                        <i className="ri-add-line align-bottom me-1"></i>{" "}
                        Nouveau Bon
                      </Button>
                    </div>
                  </div>
                </Row>
              </CardHeader>
              <Nav
                className="nav-tabs nav-tabs-custom nav-success"
                role="tablist"
              >
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
                    <i className="ri-draft-line me-1 align-bottom"></i>{" "}
                    Brouillon
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => setActiveTab("3")}
                  >
                    <i className="ri-truck-line me-1 align-bottom"></i> Livrée
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "4" })}
                    onClick={() => setActiveTab("4")}
                  >
                    <i className="ri-truck-line me-1 align-bottom"></i>{" "}
                    Partiellement Livrée
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "5" })}
                    onClick={() => setActiveTab("5")}
                  >
                    <i className="ri-close-circle-line me-1 align-bottom"></i>{" "}
                    Annulée
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
                    data={filteredBonsLivraison}
                    isGlobalFilter={false}
                    customPageSize={10}
                    divClass="table-responsive table-card mb-1 mt-0"
                    tableClass="align-middle table-nowrap"
                    theadClass="table-light text-muted text-uppercase"
                  />
                )}

                {/* Quick Client Creation Modal */}
                {/* Quick Client Creation Modal */}
<Modal
  isOpen={clientModal}
  toggle={() => setClientModal(false)}
  centered
  size="lg"
>
  <ModalHeader toggle={() => setClientModal(false)}>
    <div className="d-flex align-items-center">
      <div className="modal-icon-wrapper bg-primary bg-opacity-10 rounded-circle p-2 me-3">
        <i className="ri-user-add-line text-primary fs-4"></i>
      </div>
      <div>
        <h4 className="mb-0 fw-bold text-dark">Nouveau Client</h4>
        <small className="text-muted">Créer un nouveau client rapidement</small>
      </div>
    </div>
  </ModalHeader>
  <ModalBody>
    <Row>
      <Col md={6}>
        <div className="mb-3">
          <Label className="form-label">Raison Sociale*</Label>
          <Input
            value={newClient.raison_sociale}
            onChange={(e) =>
              setNewClient({
                ...newClient,
                raison_sociale: e.target.value,
              })
            }
            placeholder="Raison sociale"
            className="form-control-lg"
          />
        </div>
      </Col>
      <Col md={6}>
        <div className="mb-3">
          <Label className="form-label">Désignation*</Label>
          <Input
            value={newClient.designation}
            onChange={(e) =>
              setNewClient({
                ...newClient,
                designation: e.target.value,
              })
            }
            placeholder="Désignation"
            className="form-control-lg"
          />
        </div>
      </Col>
    </Row>

    <Row>
      <Col md={6}>
        <div className="mb-3">
          <Label className="form-label">Téléphone 1*</Label>
          <Input
            value={newClient.telephone1}
            onChange={(e) => {
              const formatted = formatPhoneInput(e.target.value);
              setNewClient({
                ...newClient,
                telephone1: formatted,
              });
            }}
            placeholder="XX XXX XXX"
            className="form-control-lg"
          />
        </div>
      </Col>
      <Col md={6}>
        <div className="mb-3">
          <Label className="form-label">Téléphone 2</Label>
          <Input
            value={newClient.telephone2}
            onChange={(e) => {
              const formatted = formatPhoneInput(e.target.value);
              setNewClient({
                ...newClient,
                telephone2: formatted,
              });
            }}
            placeholder="XX XXX XXX"
            className="form-control-lg"
          />
        </div>
      </Col>
    </Row>

    <div className="mb-3">
      <Label className="form-label">Adresse</Label>
      <Input
        value={newClient.adresse}
        onChange={(e) =>
          setNewClient({
            ...newClient,
            adresse: e.target.value,
          })
        }
        placeholder="Adresse complète"
        className="form-control-lg"
      />
    </div>

    <Row>
      <Col md={6}>
        <div className="mb-3">
          <Label className="form-label">Ville</Label>
          <Input
            value={newClient.ville}
            onChange={(e) =>
              setNewClient({
                ...newClient,
                ville: e.target.value,
              })
            }
            placeholder="Ville"
            className="form-control-lg"
          />
        </div>
      </Col>
      <Col md={6}>
        <div className="mb-3">
          <Label className="form-label">Code Postal</Label>
          <Input
            value={newClient.code_postal}
            onChange={(e) =>
              setNewClient({
                ...newClient,
                code_postal: e.target.value,
              })
            }
            placeholder="Code postal"
            className="form-control-lg"
          />
        </div>
      </Col>
    </Row>

    <div className="mb-3">
      <Label className="form-label">Email</Label>
      <Input
        type="email"
        value={newClient.email}
        onChange={(e) =>
          setNewClient({ ...newClient, email: e.target.value })
        }
        placeholder="email@exemple.com"
        className="form-control-lg"
      />
    </div>
  </ModalBody>
  <ModalFooter>
    <Button color="light" onClick={() => setClientModal(false)}>
      <i className="ri-close-line me-2"></i> Annuler
    </Button>
    <Button color="primary" onClick={handleCreateClient}>
      <i className="ri-add-line me-2"></i> Créer Client
    </Button>
  </ModalFooter>
</Modal>

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
                        <i className="ri-truck-line text-info fs-4"></i>
                      </div>
                      <div>
                        <h4 className="mb-0 fw-bold text-dark">
                          Bon de Livraison #
                          {selectedBonLivraison?.numeroLivraison}
                        </h4>
                        <small className="text-muted">
                          {moment(selectedBonLivraison?.dateLivraison).format(
                            "DD MMM YYYY"
                          )}
                        </small>
                      </div>
                    </div>
                  </ModalHeader>

                  <ModalBody className="pt-0">
                    {selectedBonLivraison && (
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
                                    <h5 className="mb-1">
                                      {
                                        selectedBonLivraison.client
                                          ?.raison_sociale
                                      }
                                    </h5>
                                    <p className="text-muted mb-1">
                                      <i className="ri-phone-line me-1"></i>
                                      {selectedBonLivraison.client
                                        ?.telephone1 || "N/A"}
                                    </p>
                                    <p className="text-muted mb-0">
                                      <i className="ri-map-pin-line me-1"></i>
                                      {selectedBonLivraison.client?.adresse ||
                                        "N/A"}
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
                                  Informations Livraison
                                </h6>
                                <div className="row g-2">
                                  <div className="col-6">
                                    <p className="mb-2">
                                      <span className="text-muted d-block">
                                        Vendeur:
                                      </span>
                                      <strong>
                                        {selectedBonLivraison.vendeur
                                          ? `${selectedBonLivraison.vendeur.nom} ${selectedBonLivraison.vendeur.prenom}`
                                          : "N/A"}
                                      </strong>
                                    </p>
                                  </div>
                                  <div className="col-6">
                                    <p className="mb-2">
                                      <span className="text-muted d-block">
                                        Commande:
                                      </span>
                                      <strong>
                                        {selectedBonLivraison.bonCommandeClient
                                          ?.numeroCommande || "N/A"}
                                      </strong>
                                    </p>
                                  </div>
                                  <div className="col-6">
                                    <p className="mb-2">
                                      <span className="text-muted d-block">
                                        Statut:
                                      </span>
                                      <StatusBadge
                                        status={selectedBonLivraison.status}
                                      />
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>

                        {/* Add this in your detail modal after the existing sections */}
                        {/* Replace the current delivery info section in detail modal with this: */}
                        <Card className="border-0 shadow-sm mb-4">
                          <CardBody className="p-4">
                            <h6 className="fw-semibold mb-3 text-primary">
                              <i className="ri-truck-line me-2"></i>
                              Informations de Livraison
                            </h6>
                            <Row>
                              <Col md={6}>
                                <p className="mb-2">
                                  <span className="text-muted d-block">
                                    Voiture:
                                  </span>
                                  <strong>
                                    {selectedBonLivraison?.voiture ||
                                      "Non spécifié"}
                                  </strong>
                                </p>
                              </Col>
                              <Col md={6}>
                                <p className="mb-2">
                                  <span className="text-muted d-block">
                                    Série:
                                  </span>
                                  <strong>
                                    {selectedBonLivraison?.serie ||
                                      "Non spécifié"}
                                  </strong>
                                </p>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <p className="mb-2">
                                  <span className="text-muted d-block">
                                    Chauffeur:
                                  </span>
                                  <strong>
                                    {selectedBonLivraison?.chauffeur ||
                                      "Non spécifié"}
                                  </strong>
                                </p>
                              </Col>
                              <Col md={6}>
                                <p className="mb-2">
                                  <span className="text-muted d-block">
                                    CIN:
                                  </span>
                                  <strong>
                                    {selectedBonLivraison?.cin ||
                                      "Non spécifié"}
                                  </strong>
                                </p>
                              </Col>
                            </Row>
                          </CardBody>
                        </Card>
                        {selectedBonLivraison.notes && (
                          <Card className="border-0 shadow-sm mb-4">
                            <CardBody className="p-4">
                              <h6 className="fw-semibold mb-3 text-primary">
                                <i className="ri-sticky-note-line me-2"></i>
                                Notes
                              </h6>
                              <p className="mb-0 text-muted">
                                {selectedBonLivraison.notes}
                              </p>
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
                                    <th className="text-end">
                                      Prix Unitaire HT
                                    </th>
                                    <th className="text-end">
                                      Prix Unitaire TTC
                                    </th>
                                    <th className="text-end">TVA (%)</th>
                                    <th className="text-end">Total HT</th>
                                    <th className="text-end pe-4">Total TTC</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedBonLivraison.articles.map(
                                    (item, index) => {
                                      const quantite =
                                        Number(item.quantite) || 0;
                                      const priceHT =
                                        Number(item.prix_unitaire) || 0;
                                      const tvaRate = Number(item.tva ?? 0);
                                      const remiseRate = Number(
                                        item.remise || 0
                                      );

                                      const priceTTC =
                                        Number(item.prix_ttc) ||
                                        priceHT * (1 + tvaRate / 100);
                                      const montantSousTotalHT =
                                        Math.round(quantite * priceHT * 1000) /
                                        1000;
                                      const montantNetHT =
                                        Math.round(
                                          quantite *
                                            priceHT *
                                            (1 - remiseRate / 100) *
                                            1000
                                        ) / 1000;
                                      const montantTTCLigne =
                                        Math.round(quantite * priceTTC * 1000) /
                                        1000;

                                      return (
                                        <tr
                                          key={index}
                                          className={
                                            index % 2 === 0 ? "bg-light" : ""
                                          }
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
                                            <Badge
                                              color="light"
                                              className="text-dark"
                                            >
                                              {item.article?.reference || "-"}
                                            </Badge>
                                          </td>
                                          <td className="text-end fw-semibold">
                                            {quantite}
                                          </td>
                                          <td className="text-end">
                                            {priceHT.toFixed(3)} DT
                                          </td>
                                          <td className="text-end">
                                            {priceTTC.toFixed(3)} DT
                                          </td>
                                          <td className="text-end">
                                            {tvaRate}%
                                          </td>
                                          <td className="text-end fw-semibold">
                                            {montantNetHT.toFixed(3)} DT
                                          </td>
                                          <td className="text-end pe-4 fw-semibold text-primary">
                                            {montantTTCLigne.toFixed(3)} DT
                                          </td>
                                        </tr>
                                      );
                                    }
                                  )}
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

                                    selectedBonLivraison.articles.forEach(
                                      (article) => {
                                        const qty =
                                          Number(article.quantite) || 0;
                                        const tvaRate =
                                          Number(article.tva) || 0;
                                        const remiseRate =
                                          Number(article.remise) || 0;

                                        const priceHT =
                                          Number(article.prix_unitaire) || 0;
                                        const priceTTC =
                                          Number(article.prix_ttc) ||
                                          priceHT * (1 + tvaRate / 100);
                                        const montantSousTotalHT =
                                          Math.round(qty * priceHT * 1000) /
                                          1000;
                                        const montantNetHT =
                                          Math.round(
                                            qty *
                                              priceHT *
                                              (1 - remiseRate / 100) *
                                              1000
                                          ) / 1000;
                                        const montantTTCLigne =
                                          Math.round(qty * priceTTC * 1000) /
                                          1000;
                                        const montantTVA =
                                          Math.round(
                                            (montantTTCLigne - montantNetHT) *
                                              1000
                                          ) / 1000;

                                        sousTotalHTValue += montantSousTotalHT;
                                        netHTValue += montantNetHT;
                                        totalTaxValue += montantTVA;
                                        grandTotalValue += montantTTCLigne;
                                      }
                                    );

                                    sousTotalHTValue =
                                      Math.round(sousTotalHTValue * 1000) /
                                      1000;
                                    netHTValue =
                                      Math.round(netHTValue * 1000) / 1000;
                                    totalTaxValue =
                                      Math.round(totalTaxValue * 1000) / 1000;
                                    grandTotalValue =
                                      Math.round(grandTotalValue * 1000) / 1000;

                                    const remiseValue =
                                      Number(selectedBonLivraison.remise) || 0;
                                    const remiseTypeValue =
                                      selectedBonLivraison.remiseType ||
                                      "percentage";

                                    let finalTotalValue = grandTotalValue;
                                    let discountAmountValue = 0;
                                    let netHTAfterDiscount = netHTValue;
                                    let totalTaxAfterDiscount = totalTaxValue;
                                    let discountPercentage = 0;

                                    if (remiseValue > 0) {
                                      if (remiseTypeValue === "percentage") {
                                        discountAmountValue =
                                          Math.round(
                                            netHTValue *
                                              (remiseValue / 100) *
                                              1000
                                          ) / 1000;
                                        netHTAfterDiscount =
                                          Math.round(
                                            (netHTValue - discountAmountValue) *
                                              1000
                                          ) / 1000;

                                        const discountRatio =
                                          netHTAfterDiscount / netHTValue;
                                        totalTaxAfterDiscount =
                                          Math.round(
                                            totalTaxValue * discountRatio * 1000
                                          ) / 1000;

                                        finalTotalValue =
                                          Math.round(
                                            (netHTAfterDiscount +
                                              totalTaxAfterDiscount) *
                                              1000
                                          ) / 1000;
                                      } else if (remiseTypeValue === "fixed") {
                                        finalTotalValue =
                                          Math.round(
                                            Number(remiseValue) * 1000
                                          ) / 1000;

                                        const tvaToHtRatio =
                                          totalTaxValue / netHTValue;
                                        const htAfterDiscount =
                                          Math.round(
                                            (finalTotalValue /
                                              (1 + tvaToHtRatio)) *
                                              1000
                                          ) / 1000;

                                        discountAmountValue =
                                          Math.round(
                                            (netHTValue - htAfterDiscount) *
                                              1000
                                          ) / 1000;
                                        netHTAfterDiscount = htAfterDiscount;
                                        totalTaxAfterDiscount =
                                          Math.round(
                                            netHTAfterDiscount *
                                              tvaToHtRatio *
                                              1000
                                          ) / 1000;

                                        discountPercentage =
                                          Math.round(
                                            (discountAmountValue / netHTValue) *
                                              100 *
                                              100
                                          ) / 100;
                                      }
                                    }

                                    const displayNetHT =
                                      remiseValue > 0
                                        ? netHTAfterDiscount
                                        : netHTValue;
                                    const displayTotalTax =
                                      remiseValue > 0
                                        ? totalTaxAfterDiscount
                                        : totalTaxValue;

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
                                                {remiseTypeValue ===
                                                "percentage"
                                                  ? `Remise (${remiseValue}%)`
                                                  : `Remise (Montant fixe) ${discountPercentage}%`}
                                              </th>
                                              <td className="text-end text-danger fw-bold fs-6">
                                                -{" "}
                                                {discountAmountValue.toFixed(3)}{" "}
                                                DT
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
                      </div>
                    )}
                  </ModalBody>

                  <ModalFooter className="border-0 pt-4">
                    <Button
                      color="success"
                      size="md"
                      onClick={() => {
                        if (selectedBonLivraison) {
                          setBonLivraison(selectedBonLivraison);
                          setSelectedClient(
                            selectedBonLivraison.client || null
                          );
                          setSelectedArticles(
                            selectedBonLivraison.articles.map((item: any) => ({
                              article_id: item.article.id,
                              quantite: item.quantite,
                              prixUnitaire: parseFloat(item.prix_unitaire),
                              prixTTC:
                                parseFloat(item.prix_ttc) ||
                                parseFloat(item.prix_unitaire) *
                                  (1 + (item.tva || 0) / 100),
                              tva:
                                item.tva != null ? parseFloat(item.tva) : null,
                              remise:
                                item.remise != null
                                  ? parseFloat(item.remise)
                                  : null,
                              articleDetails: item.article,
                            }))
                          );
                          setGlobalRemise(selectedBonLivraison.remise || 0);
                          setRemiseType(
                            (selectedBonLivraison.remiseType as
                              | "percentage"
                              | "fixed"
                              | undefined) ?? "percentage"
                          );
                          setShowRemise((selectedBonLivraison.remise || 0) > 0);
                          setIsCreatingFacture(true);
                          setIsEdit(false);
                          setTimbreFiscal(false);

                          validation.setValues({
                            ...validation.values,
                            numeroFacture: nextNumeroFacture,
                            client_id: selectedBonLivraison.client?.id ?? "",
                            vendeur_id: selectedBonLivraison.vendeur?.id ?? "",
                            dateFacture: moment().format("YYYY-MM-DD"),
                            // dateEcheance: "",
                            //  conditionPaiement: "",
                            status: "Brouillon",
                            notes: selectedBonLivraison.notes ?? "",
                            isCreatingFacture: true,
                          });

                          setModal(true);
                        }
                      }}
                      className="btn-invoice btn-invoice-success me-2"
                    >
                      <i className="ri-file-text-line me-2"></i> Créer Facture
                    </Button>

                    <Button
                      color="primary"
                      onClick={() => {
                        setSelectedBonLivraisonForValorisation(
                          selectedBonLivraison
                        );
                        setValorisationModal(true);
                      }}
                      className="btn-invoice btn-invoice-primary me-2"
                      disabled={!selectedBonLivraison}
                    >
                      <i className="ri-file-pdf-line me-2"></i> Imprimer PDF
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
                        <i className="ri-truck-line text-primary fs-4"></i>
                      </div>
                      <div>
                        <h4 className="mb-0 fw-bold text-dark">
                          {isCreatingFacture
                            ? "Créer Facture"
                            : isEdit
                            ? "Modifier Bon de Livraison"
                            : "Créer Bon de Livraison"}
                        </h4>
                        <small className="text-muted">
                          {isCreatingFacture
                            ? "Créer une facture à partir de ce bon de livraison"
                            : isEdit
                            ? "Modifier les détails du bon de livraison existant"
                            : "Créer un nouveau bon de livraison"}
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
                      {/* Header Information Section */}
                      <Card className="border-0 shadow-sm mb-4">
                        <CardBody className="p-4">
                          <h5 className="fw-semibold mb-4 text-primary">
                            <i className="ri-information-line me-2"></i>
                            Informations Générales
                          </h5>

                          {/* Ligne unique avec Numéro, Date et Timbre */}
                          <Row className="align-items-end">
                            {isCreatingFacture ? (
                              <>
                                {/* Numéro de Facture */}
                                <Col md={4}>
                                  <div className="mb-3">
                                    <Label className="form-label-lg fw-semibold">
                                      Numéro de Facture*
                                    </Label>
                                    <Input
                                      name="numeroFacture"
                                      value={validation.values.numeroFacture}
                                      onChange={validation.handleChange}
                                      invalid={
                                        validation.touched.numeroFacture &&
                                        !!validation.errors.numeroFacture
                                      }
                                      className="form-control-lg"
                                      placeholder="FAC-2024-001"
                                    />
                                    <FormFeedback className="fs-6">
                                      {validation.errors.numeroFacture}
                                    </FormFeedback>
                                  </div>
                                </Col>

                                {/* Date de Facture */}
                                <Col md={3}>
                                  <div className="mb-3">
                                    <Label className="form-label-lg fw-semibold">
                                      Date de Facture*
                                    </Label>
                                    <Input
                                      type="date"
                                      name="dateFacture"
                                      value={validation.values.dateFacture}
                                      onChange={validation.handleChange}
                                      invalid={
                                        validation.touched.dateFacture &&
                                        !!validation.errors.dateFacture
                                      }
                                      className="form-control-lg"
                                    />
                                    <FormFeedback className="fs-6">
                                      {validation.errors.dateFacture as string}
                                    </FormFeedback>
                                  </div>
                                </Col>

                                {/* Timbre Fiscal */}
                                <Col md={5}>
                                  <div className="mb-3">
                                    <Label className="form-label-lg fw-semibold mb-2">
                                      Timbre Fiscal
                                    </Label>
                                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded border h-100">
                                      {/* Checkbox */}
                                      <div className="form-check mb-0">
                                        <Input
                                          type="checkbox"
                                          id="timbreFiscal"
                                          checked={timbreFiscal}
                                          onChange={(e) =>
                                            setTimbreFiscal(e.target.checked)
                                          }
                                          className="form-check-input"
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            cursor: "pointer",
                                          }}
                                        />
                                      </div>

                                      {/* Icône et texte */}
                                      <div className="d-flex align-items-center gap-2 flex-grow-1">
                                        <i className="ri-stamp-line text-warning fs-5"></i>
                                        <div>
                                          <Label
                                            for="timbreFiscal"
                                            className="form-check-label mb-0 fw-semibold fs-6 cursor-pointer"
                                          >
                                            Timbre Fiscal
                                          </Label>
                                          <div className="timbre-description">
                                            <small className="text-muted">
                                              +1.000 DT ajouté au total
                                            </small>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Badge du montant */}
                                      <div className="timbre-amount">
                                        <Badge
                                          color={
                                            timbreFiscal
                                              ? "success"
                                              : "secondary"
                                          }
                                          className="fs-6 px-3 py-2"
                                        >
                                          {timbreFiscal
                                            ? "+1.000 DT"
                                            : "Désactivé"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              </>
                            ) : (
                              <>
                                {/* Numéro de Livraison */}
                                <Col md={4}>
                                  <div className="mb-3">
                                    <Label className="form-label-lg fw-semibold">
                                      Numéro de Livraison*
                                    </Label>
                                    <Input
                                      name="numeroLivraison"
                                      value={validation.values.numeroLivraison}
                                      onChange={validation.handleChange}
                                      invalid={
                                        validation.touched.numeroLivraison &&
                                        !!validation.errors.numeroLivraison
                                      }
                                      readOnly={isEdit}
                                      className="form-control-lg"
                                      placeholder="LIV-2024-001"
                                    />
                                    <FormFeedback className="fs-6">
                                      {validation.errors.numeroLivraison}
                                    </FormFeedback>
                                  </div>
                                </Col>

                                {/* Date de Livraison */}
                                <Col md={4}>
                                  <div className="mb-3">
                                    <Label className="form-label-lg fw-semibold">
                                      Date de Livraison*
                                    </Label>
                                    <Input
                                      type="date"
                                      name="dateLivraison"
                                      value={validation.values.dateLivraison}
                                      onChange={validation.handleChange}
                                      invalid={
                                        validation.touched.dateLivraison &&
                                        !!validation.errors.dateLivraison
                                      }
                                      className="form-control-lg"
                                    />
                                    <FormFeedback className="fs-6">
                                      {
                                        validation.errors
                                          .dateLivraison as string
                                      }
                                    </FormFeedback>
                                  </div>
                                </Col>

                                {/* Espace vide pour alignement */}
                                <Col md={4}>
                                  {/* Espace réservé pour maintenir l'alignement */}
                                </Col>
                              </>
                            )}
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

                              {/* Enhanced Client Search Section */}
                              <div className="mb-3">
                                <Label className="form-label-lg fw-semibold">
                                  Client*
                                </Label>

                                <div className="position-relative">
                                  <Input
                                    type="text"
                                    placeholder="Rechercher par nom, raison sociale ou téléphone..."
                                    value={
                                      selectedClient
                                        ? selectedClient.raison_sociale
                                        : clientSearch
                                    }
                                    onChange={(e) => {
                                      const value = e.target.value;

                                      if (!value) {
                                        setSelectedClient(null);
                                        validation.setFieldValue(
                                          "client_id",
                                          ""
                                        );
                                        setClientSearch("");
                                      } else {
                                        // Auto-format if it looks like a phone number (mostly digits)
                                        const digitCount = (
                                          value.match(/\d/g) || []
                                        ).length;
                                        const totalLength = value.length;

                                        if (digitCount >= totalLength * 0.7) {
                                          // If 70% or more are digits
                                          const formatted =
                                            formatPhoneInput(value);
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
                                    readOnly={
                                      !!selectedClient || isCreatingFacture
                                    }
                                    className="form-control-lg pe-10"
                                  />

                                  {/* Clear button when client is selected */}
                                  {selectedClient && !isCreatingFacture && (
                                    <button
                                      type="button"
                                      className="btn btn-link text-danger position-absolute end-0 top-50 translate-middle-y p-0 me-3"
                                      onClick={() => {
                                        setSelectedClient(null);
                                        validation.setFieldValue(
                                          "client_id",
                                          ""
                                        );
                                        setClientSearch("");
                                      }}
                                      title="Changer de client"
                                    >
                                      <i className="ri-close-line fs-5"></i>
                                    </button>
                                  )}

                                  {/* Add button when no client is selected */}
                                  {!selectedClient && !isCreatingFacture && (
                                    <button
                                      type="button"
                                      className="btn btn-link text-primary position-absolute end-0 top-50 translate-middle-y p-0 me-3"
                                      onClick={() => setClientModal(true)}
                                      title="Ajouter un nouveau client"
                                    >
                                      <i className="ri-add-line fs-5"></i>
                                    </button>
                                  )}
                                </div>

                                {/* Enhanced Client Dropdown Results */}
                                {!isCreatingFacture &&
                                  !selectedClient &&
                                  clientSearch.length >= 1 && (
                                    <div
                                      className="search-results mt-2 border rounded shadow-sm"
                                      style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                        position: "absolute",
                                        width: "100%",
                                        zIndex: 1000,
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
                                                  {formatPhoneDisplay(
                                                    c.telephone1
                                                  )}
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
                                                    {formatPhoneDisplay(
                                                      c.telephone2
                                                    )}
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
                                          <i className="ri-search-line me-1"></i>
                                          Aucun résultat trouvé
                                        </div>
                                      )}
                                    </div>
                                  )}

                                {validation.touched.client_id &&
                                  validation.errors.client_id && (
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

                      {/* Global Discount Section  :      <Card className="border-0 shadow-sm mb-4">
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
      </Card>*/}

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
                                    if (e.key === "ArrowDown") {
                                      e.preventDefault();
                                      setFocusedIndex((prev) =>
                                        prev < filteredArticles.length - 1
                                          ? prev + 1
                                          : 0
                                      );
                                    }
                                    // Handle arrow up
                                    else if (e.key === "ArrowUp") {
                                      e.preventDefault();
                                      setFocusedIndex((prev) =>
                                        prev > 0
                                          ? prev - 1
                                          : filteredArticles.length - 1
                                      );
                                    }
                                    // Handle Enter to select focused item
                                    else if (
                                      e.key === "Enter" &&
                                      focusedIndex >= 0
                                    ) {
                                      e.preventDefault();
                                      const article =
                                        filteredArticles[focusedIndex];
                                      handleAddArticle(article.id.toString());
                                      setArticleSearch("");
                                      setFilteredArticles([]);
                                      setFocusedIndex(-1);
                                    }
                                    // Handle Enter to select first item when no focus
                                    else if (
                                      e.key === "Enter" &&
                                      filteredArticles.length > 0 &&
                                      focusedIndex === -1
                                    ) {
                                      e.preventDefault();
                                      const firstArticle = filteredArticles[0];
                                      handleAddArticle(
                                        firstArticle.id.toString()
                                      );
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

                            {/* Article Dropdown Results */}
                            {/* Update the dropdown container to handle scrolling with proper TypeScript */}
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
                                onKeyDown={(e) => e.stopPropagation()} // Prevent key events from bubbling
                              >
                                {filteredArticles.length > 0 ? (
                                  <ul className="list-group list-group-flush">
                                    {filteredArticles.map((article, index) => {
                                      // Create ref for each item if needed
                                      const itemRef =
                                        React.createRef<HTMLLIElement>();
                                      if (!itemRefs[index]) {
                                        itemRefs[index] = itemRef;
                                      }

                                      return (
                                        <li
                                          key={article.id}
                                          ref={itemRefs[index]}
                                          className={`list-group-item list-group-item-action ${
                                            focusedIndex === index
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={() => {
                                            handleAddArticle(
                                              article.id.toString()
                                            );
                                            setArticleSearch("");
                                            setFilteredArticles([]);
                                            setFocusedIndex(-1);
                                          }}
                                          style={{
                                            cursor: "pointer",
                                            padding: "12px 15px",
                                            opacity: selectedArticles.some(
                                              (item) =>
                                                item.article_id === article.id
                                            )
                                              ? 0.6
                                              : 1,
                                            backgroundColor:
                                              focusedIndex === index
                                                ? "#e7f1ff"
                                                : "transparent",
                                            borderLeft:
                                              focusedIndex === index
                                                ? "4px solid #0d6efd"
                                                : "none",
                                          }}
                                          onMouseEnter={() =>
                                            setFocusedIndex(index)
                                          } // Highlight on hover
                                        >
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div className="flex-grow-1">
                                              <div className="d-flex align-items-center mb-1">
                                                <strong className="fs-6 me-2 text-primary">
                                                  {article.reference}
                                                </strong>
                                                <span className="badge bg-light text-dark me-2">
                                                  Stock: {article.qte || 0}
                                                </span>
                                              </div>
                                              <small
                                                className="text-muted d-block"
                                                style={{ fontSize: "0.85rem" }}
                                              >
                                                {article.designation}
                                              </small>
                                              <div className="mt-1">
                                                <span className="badge bg-success text-white">
                                                  TTC:{" "}
                                                  {(
                                                    Number(article.puv_ttc) || 0
                                                  ).toFixed(3)}{" "}
                                                  DT
                                                </span>
                                                {article.tva &&
                                                  article.tva > 0 && (
                                                    <span className="badge bg-info ms-1">
                                                      TVA: {article.tva}%
                                                    </span>
                                                  )}
                                              </div>
                                            </div>
                                            {selectedArticles.some(
                                              (item) =>
                                                item.article_id === article.id
                                            ) ? (
                                              <Badge
                                                color="secondary"
                                                className="fs-6"
                                              >
                                                <i className="ri-check-line me-1"></i>
                                                Ajouté
                                              </Badge>
                                            ) : (
                                              <Badge
                                                color="success"
                                                className="fs-6"
                                              >
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

                                      const qty = Number(item.quantite) || 0;

                                      let priceHT =
                                        Number(item.prixUnitaire) || 0;
                                      let priceTTC = Number(item.prixTTC) || 0;

                                      // Replace the problematic section in Devis component with this:

                                      if (
                                        editingTTC[item.article_id] !==
                                        undefined
                                      ) {
                                        const editingValue = parseNumericInput(
                                          editingTTC[item.article_id]
                                        );
                                        if (
                                          !isNaN(editingValue) &&
                                          editingValue >= 0
                                        ) {
                                          priceTTC = parseFloat(
                                            editingValue.toFixed(3)
                                          ); // ✅ Add this line
                                          const tvaRate = Number(item.tva) || 0;
                                          if (tvaRate > 0) {
                                            const coefficient =
                                              1 + tvaRate / 100;
                                            priceHT = parseFloat(
                                              (priceTTC / coefficient).toFixed(
                                                3
                                              )
                                            ); // ✅ Use same method
                                          } else {
                                            priceHT = priceTTC;
                                          }
                                        }
                                      } else if (
                                        editingTTC[item.article_id] !==
                                        undefined
                                      ) {
                                        const editingValue = parseNumericInput(
                                          editingTTC[item.article_id]
                                        );
                                        if (
                                          !isNaN(editingValue) &&
                                          editingValue >= 0
                                        ) {
                                          priceTTC = editingValue;
                                          const tvaRate = Number(item.tva) || 0;
                                          priceHT =
                                            tvaRate > 0
                                              ? priceTTC / (1 + tvaRate / 100)
                                              : priceTTC;
                                        }
                                      }

                                      const montantHTLigne = (
                                        qty * priceHT
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

                                {/* Right Side - Calculations */}
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

                                        {/* Timbre Fiscal for Factures */}
                                        {isCreatingFacture && timbreFiscal && (
                                          <tr className="real-time-update">
                                            <th className="text-end text-muted fs-6">
                                              Timbre Fiscal:
                                            </th>
                                            <td className="text-end fw-semibold fs-6">
                                              1.000 DT
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

                      {/* Delivery Information Section */}
                      {/* Delivery Information Section */}
                      <Card className="border-0 shadow-sm">
                        <CardBody className="p-4">
                          <h5 className="fw-semibold mb-3 text-primary">
                            <i className="ri-truck-line me-2"></i>
                            Informations de Livraison
                          </h5>

                          <Row>
                            <Col md={6}>
                              <div className="mb-3">
                                <Label className="form-label-lg fw-semibold">
                                  Voiture
                                </Label>
                                <Input
                                  type="text"
                                  value={livraisonInfo.voiture}
                                  onChange={(e) =>
                                    setLivraisonInfo({
                                      ...livraisonInfo,
                                      voiture: e.target.value,
                                    })
                                  }
                                  placeholder="Ex: Berlingo"
                                  className="form-control-lg"
                                />
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3">
                                <Label className="form-label-lg fw-semibold">
                                  Série
                                </Label>
                                <Input
                                  type="text"
                                  value={livraisonInfo.serie}
                                  onChange={(e) =>
                                    setLivraisonInfo({
                                      ...livraisonInfo,
                                      serie: e.target.value,
                                    })
                                  }
                                  placeholder="Ex: 156 TN 8972"
                                  className="form-control-lg"
                                />
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <div className="mb-3">
                                <Label className="form-label-lg fw-semibold">
                                  Chauffeur
                                </Label>
                                <Input
                                  type="text"
                                  value={livraisonInfo.chauffeur}
                                  onChange={(e) =>
                                    setLivraisonInfo({
                                      ...livraisonInfo,
                                      chauffeur: e.target.value,
                                    })
                                  }
                                  placeholder="Ex: Farouk Harbeuge"
                                  className="form-control-lg"
                                />
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3">
                                <Label className="form-label-lg fw-semibold">
                                  CIN
                                </Label>
                                <Input
                                  type="text"
                                  value={livraisonInfo.cin}
                                  onChange={(e) =>
                                    setLivraisonInfo({
                                      ...livraisonInfo,
                                      cin: e.target.value,
                                    })
                                  }
                                  placeholder="Ex: 12345678"
                                  className="form-control-lg"
                                />
                              </div>
                            </Col>
                          </Row>
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
                <ToastContainer />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add this modal after your existing modals but before the PDF modal */}
      <Modal
        isOpen={valorisationModal}
        toggle={() => setValorisationModal(false)}
        centered
      >
        <ModalHeader toggle={() => setValorisationModal(false)}>
          Options d'impression
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <h5 className="mb-4">Choisir le type de bon de livraison</h5>
            <div className="row">
              <div className="col-6">
                <div
                  className={`card border-2 ${
                    isValorise ? "border-primary" : "border-light"
                  } cursor-pointer`}
                  onClick={() => setIsValorise(true)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center">
                    <i className="ri-money-euro-circle-line text-primary fs-1 mb-3"></i>
                    <h6 className="card-title">Valorisé</h6>
                    <p className="text-muted small">Avec montants et totaux</p>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div
                  className={`card border-2 ${
                    !isValorise ? "border-primary" : "border-light"
                  } cursor-pointer`}
                  onClick={() => setIsValorise(false)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center">
                    <i className="ri-file-list-line text-secondary fs-1 mb-3"></i>
                    <h6 className="card-title">Non Valorisé</h6>
                    <p className="text-muted small">Sans montants ni totaux</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setValorisationModal(false)}>
            Annuler
          </Button>
          <Button
            color="primary"
            onClick={() => {
              if (selectedBonLivraisonForValorisation) {
                setSelectedBonLivraisonForPdf(
                  selectedBonLivraisonForValorisation
                );
                setPdfModal(true);
              }
              setValorisationModal(false);
            }}
          >
            <i className="ri-file-pdf-line me-2"></i>
            Générer PDF
          </Button>
        </ModalFooter>
      </Modal>

      {selectedBonLivraisonForPdf && (
        <BonLivraisonPDFModal
          isOpen={pdfModal}
          toggle={() => setPdfModal(false)}
          bonLivraison={selectedBonLivraisonForPdf}
          companyInfo={companyInfo}
          isValorise={isValorise}
        />
      )}
    </div>
  );
};

export default BonLivraisonList;
