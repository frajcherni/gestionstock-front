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
  fetchBonsCommandeClient,
  createBonCommandeClient,
  updateBonCommandeClient,
  deleteBonCommandeClient,
  fetchNextCommandeNumber,
} from "../../../Components/CommandeClient/CommandeClientServices";
import {
  fetchArticles,
  fetchClients,
  fetchVendeurs,
} from "../../../Components/Article/ArticleServices";
import {
  createBonLivraison,
  fetchNextLivraisonNumber,
} from "../../../Components/CommandeClient/BonLivraisonServices";
import {
  Article,
  Client,
  Vendeur,
  BonCommandeClient,
  PaiementClient,
} from "../../../Components/Article/Interfaces";

// Add these imports if not already present
import {
  createClient,
  createArticle,
  fetchFournisseurs,
  fetchCategories,
} from "../../../Components/Article/ArticleServices";
import { Categorie, Fournisseur } from "../../../Components/Article/Interfaces";
import classnames from "classnames";
import BonCommandePDFModal from "./BonCommandePDFModal";
import { useProfile } from "Components/Hooks/UserHooks";
import logo from "../../../assets/images/imglogo.png";
import {
  createPaiementClient,
  fetchPaiementsClient,
  fetchNextPaiementNumberFromAPI,
} from "./PaiementBcClientServices";
const BonCommandeClientList = () => {
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
  const [paiementClients, setPaiementClients] = useState<PaiementClient[]>([]);

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
  const [nextNumeroLivraison, setNextNumeroLivraison] = useState("");
  const [editingTTC, setEditingTTC] = useState<{ [key: number]: string }>({});
  const [editingHT, setEditingHT] = useState<{ [key: number]: string }>({});
  const [newDeliveryQuantities, setNewDeliveryQuantities] = useState<{
    [key: number]: number | "";
  }>({});
  const [paiementModal, setPaiementModal] = useState(false);
  const [nextPaiementNumber, setNextPaiementNumber] = useState("");
  const [selectedBonForPaiement, setSelectedBonForPaiement] =
    useState<BonCommandeClient | null>(null);

  const [showRetention, setShowRetention] = useState(false);
  const [retentionRate, setRetentionRate] = useState<number>(1); // Default %
  const [retentionAmount, setRetentionAmount] = useState<number>(0);

  // Ajouter ces états près des autres états du composant
  // Remplacer le type des méthodes de règlement
  // REPLACE the current methodesReglement state:
  const [methodesReglement, setMethodesReglement] = useState<
    Array<{
      id: string;
      method: "especes" | "cheque" | "virement" | "traite" | "carte" | "tpe" | "retenue";
      amount: string; // Change to string for empty value
      numero?: string;
      banque?: string;
      dateEcheance?: string;
      tauxRetention?: number; 
    }>
  >([]); // Empty array - no default payment method // ← Tableau vide au lieu d'avoir une méthode par défaut

  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const [espaceNotes, setEspaceNotes] = useState("");

  // Add these state variables near your existing states
  const [clientModal, setClientModal] = useState(false);
  const [articleModal, setArticleModal] = useState(false);

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

  const [selectedArticles, setSelectedArticles] = useState<
    {
      article_id: number;
      quantite: number | ""; // Allow empty string
      prixUnitaire: number;
      prixTTC: number; // Add prixTTC
      tva?: number | null;
      remise?: number | null;
      articleDetails?: Article;
      quantiteLivree: number | "";
    }[]
  >([]);
  const [remiseType, setRemiseType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [globalRemise, setGlobalRemise] = useState<number>(0);
  const [isCreatingLivraison, setIsCreatingLivraison] = useState(false);

  const [pdfModal, setPdfModal] = useState(false);
  const [selectedBonCommandeForPdf, setSelectedBonCommandeForPdf] =
    useState<BonCommandeClient | null>(null);
  const { userProfile, loading: profileLoading } = useProfile();

  // Add this helper function to safely convert to numbers
const getSafeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

  // Company info for PDF
  const companyInfo = useMemo(
    () => ({
      name: userProfile?.company_name || "Votre Société",
      address: userProfile?.company_address || "Adresse",
      city: userProfile?.company_city || "Ville",
      phone: userProfile?.company_phone || "Téléphone",
      gsm: userProfile?.company_gsm || "Téléphone",
      email: userProfile?.company_email || "Email",
      website: userProfile?.company_website || "Site web",
      taxId: userProfile?.company_tax_id || "MF",
      logo: logo,
    }),
    [userProfile]
  );

  const handleMontantChangePaiement = (e: any) => {
    let value = e.target.value;
    if (value === "" || /^[0-9]*[,.]?[0-9]*$/.test(value)) {
      value = value.replace(".", ",");
      const commaCount = (value.match(/,/g) || []).length;
      if (commaCount <= 1) {
        paiementValidation.setFieldValue("montant", value);
      }
    }
  };

  // Add this effect to calculate retention in real-time

  // Function to open PDF modal
  const openPdfModal = (bonCommande: BonCommandeClient) => {
    setSelectedBonCommandeForPdf(bonCommande);
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

  // Phone formatting function
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

  const openPaiementModal = async (bonCommande: BonCommandeClient) => {
    setSelectedBonForPaiement(bonCommande);
    paiementValidation.resetForm();
  
    try {
      const nextNumber = await fetchNextPaiementNumberFromAPI();
      setNextPaiementNumber(nextNumber);
  
      // Check if there's remise and use totalTTCAfterRemise, else use totalTTC
      const hasRemise = bonCommande.remise && Number(bonCommande.remise) > 0;
      const baseTotal = hasRemise 
        ? getSafeNumber(bonCommande.totalTTCAfterRemise)
        : getSafeNumber(bonCommande.totalTTC);
      
      const retentionAmount = getSafeNumber(bonCommande.montantRetenue);
      const montantPaye = getSafeNumber(bonCommande.montantPaye);
      
      // Calculate the amount available for payment (after retention deduction)
      const amountAfterRetention = baseTotal - retentionAmount;
      
      // Use the amount after retention for the payment modal
      const initialMontant = Math.max(0, amountAfterRetention - montantPaye)
        .toFixed(3)
        .replace(".", ",");
  
      paiementValidation.setValues({
        montant: initialMontant,
        modePaiement: "Espece",
        numeroPaiement: nextNumber,
        date: moment().format("YYYY-MM-DD"),
        numeroCheque: "",
        banque: "",
        numeroTraite: "",
        dateEcheance: "",
        notes: "",
      });
  
      setPaiementModal(true);
    } catch (err) {
      console.error("Failed to fetch next payment number:", err);
      const year = moment().format("YYYY");
      const defaultNumber = `PAY-C${year}${String(0 + 1).padStart(5, "0")}`;
  
      // Check if there's remise and use totalTTCAfterRemise, else use totalTTC
      const hasRemise = bonCommande.remise && Number(bonCommande.remise) > 0;
      const baseTotal = hasRemise 
        ? getSafeNumber(bonCommande.totalTTCAfterRemise)
        : getSafeNumber(bonCommande.totalTTC);
      
      const retentionAmount = getSafeNumber(bonCommande.montantRetenue);
      const montantPaye = getSafeNumber(bonCommande.montantPaye);
      const amountAfterRetention = baseTotal - retentionAmount;
      const initialMontant = Math.max(0, amountAfterRetention - montantPaye)
        .toFixed(3)
        .replace(".", ",");
  
      paiementValidation.setValues({
        montant: initialMontant,
        modePaiement: "Espece",
        numeroPaiement: defaultNumber,
        date: moment().format("YYYY-MM-DD"),
        numeroCheque: "",
        banque: "",
        numeroTraite: "",
        dateEcheance: "",
        notes: "",
      });
  
      setPaiementModal(true);
    }
  };

  const handlePaiementSubmit = async (values: any) => {
    if (!selectedBonForPaiement) return;

    if (selectedBonForPaiement.status === "Annule") {
      toast.error(
        "Impossible d'ajouter un paiement pour une commande annulée."
      );
      return;
    }

    // Convert amount to number
    let paiementAmount: number;
    if (typeof values.montant === "string") {
      paiementAmount = parseFloat(values.montant.replace(",", "."));
    } else {
      paiementAmount = Number(values.montant);
    }

    // Validate amount
    if (isNaN(paiementAmount) || paiementAmount <= 0) {
      toast.error("Le montant doit être un nombre valide supérieur à 0");
      return;
    }

    // Calculate retention for "Retention" payment method
    let retentionMontant = 0;
    let netAmount = paiementAmount;

    if (values.modePaiement === "Retention") {
      // FIX: Calculate retention as 1% of the net à payer (resteAPayer)
      const netAPayer = selectedBonForPaiement.resteAPayer || 0;
      retentionMontant = (netAPayer * retentionRate) / 100;
      netAmount = netAPayer - retentionMontant;

      // Validate net amount is positive
      if (netAmount <= 0) {
        toast.error("Le montant net après retention doit être supérieur à 0");
        return;
      }

      // Validate that the payment amount equals the net amount after retention
      if (Math.abs(paiementAmount - netAmount) > 0.001) {
        toast.error(
          `Le montant payé doit être égal au net après retention: ${netAmount.toFixed(
            3
          )} DT`
        );
        return;
      }
    }

    try {
      const paiementData = {
        bonCommandeClient_id: selectedBonForPaiement.id,
        client_id: selectedBonForPaiement.client_id,
        montant:
          values.modePaiement === "Retention" ? netAmount : paiementAmount,
        modePaiement: values.modePaiement,
        numeroPaiement: values.numeroPaiement,
        date: values.date,
        notes: values.notes,
        ...(values.modePaiement === "Cheque" && {
          numeroCheque: values.numeroCheque,
          banque: values.banque,
        }),
        ...(values.modePaiement === "Traite" && {
          numeroTraite: values.numeroTraite,
          dateEcheance: values.dateEcheance,
        }),
      };

      await createPaiementClient(paiementData);
      setPaiementModal(false);
      fetchData();

      if (values.modePaiement === "Retention") {
        toast.success(
          `Paiement avec retention enregistré: ${netAmount.toFixed(
            3
          )} DT (retenue: ${retentionMontant.toFixed(3)} DT)`
        );
      } else {
        toast.success("Paiement enregistré avec succès");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Échec de l'enregistrement du paiement"
      );
    }
  };

  const paiementValidation = useFormik({
    enableReinitialize: true,
    initialValues: {
      montant: "",
      modePaiement: "Espece",
      numeroPaiement: nextPaiementNumber,
      date: moment().format("YYYY-MM-DD"),
      numeroCheque: "",
      banque: "",
      numeroTraite: "",
      dateEcheance: "",
      notes: "",
    },
    validationSchema: Yup.object({
      montant: Yup.string()
        .test(
          "is-valid-amount",
          "Le montant doit être un nombre valide",
          function (value) {
            if (!value) return false;
            const numericValue = parseFloat(value.replace(",", "."));
            return !isNaN(numericValue) && numericValue > 0;
          }
        )
        .test(
          "min-amount",
          "Le montant doit être supérieur à 0",
          function (value) {
            if (!value) return false;
            const numericValue = parseFloat(value.replace(",", "."));
            return numericValue >= 0.01;
          }
        )
      // In the paiementValidation schema, update the max-reste test:
.test(
  "max-reste",
  "Le montant ne peut pas dépasser le reste à payer après retenue",
  function (value) {
    if (!value || !selectedBonForPaiement) return false;
    const numericValue = parseFloat(value.replace(",", "."));
    
    // Check if there's remise and use totalTTCAfterRemise, else use totalTTC
    const hasRemise = selectedBonForPaiement.remise && Number(selectedBonForPaiement.remise) > 0;
    const baseTotal = hasRemise 
      ? getSafeNumber(selectedBonForPaiement.totalTTCAfterRemise)
      : getSafeNumber(selectedBonForPaiement.totalTTC);
    
    const retentionAmount = getSafeNumber(selectedBonForPaiement.montantRetenue);
    const montantPaye = getSafeNumber(selectedBonForPaiement.montantPaye);
    const amountAfterRetention = baseTotal - retentionAmount;
    const availableAmount = Math.max(0, amountAfterRetention - montantPaye);
    
    const roundedValue = Math.round(numericValue * 1000) / 1000;
    const roundedAvailable = Math.round(availableAmount * 1000) / 1000;
    return roundedValue <= roundedAvailable;
  }
)
        .required("Le montant est requis"),
      modePaiement: Yup.string().required("Le mode de paiement est requis"),
      numeroPaiement: Yup.string().required("Le numéro de paiement est requis"),
      date: Yup.date().required("La date est requise"),
    }),
    onSubmit: (values) => {
      let numericMontant: number;
  
      if (typeof values.montant === "string") {
        numericMontant = parseFloat(values.montant.replace(",", "."));
      } else {
        numericMontant = Number(values.montant);
      }
  
      handlePaiementSubmit({
        ...values,
        montant: numericMontant,
      });
    },
  });

  // Add this effect to set the montant when the payment modal opens
useEffect(() => {
  if (paiementModal && selectedBonForPaiement) {
    const totalNet = getSafeNumber(selectedBonForPaiement.totalTTC);
    const retentionAmount = getSafeNumber(selectedBonForPaiement.montantRetenue);
    const montantPaye = getSafeNumber(selectedBonForPaiement.montantPaye);
    
    const amountAfterRetention = totalNet - retentionAmount;
    const initialMontant = Math.max(0, amountAfterRetention - montantPaye)
      .toFixed(3)
      .replace(".", ",");

    // Only update if the current value is still the default "0,000"
    if (paiementValidation.values.montant === "0,000") {
      paiementValidation.setFieldValue("montant", initialMontant);
    }
  }
}, [paiementModal, selectedBonForPaiement]);

  // Update the effect to calculate retention based on resteAPayer
  useEffect(() => {
    if (
      paiementModal &&
      selectedBonForPaiement &&
      paiementValidation.values.modePaiement === "Retention"
    ) {
      // Use the resteAPayer for retention calculation, not the entered amount
      const netAPayer = selectedBonForPaiement.totalTTC || 0;
      const calculatedRetention = (netAPayer * retentionRate) / 100;
      const netAmountAfterRetention = netAPayer - calculatedRetention;

      setRetentionAmount(calculatedRetention);

      // Auto-fill the montant field with net amount after retention
      paiementValidation.setFieldValue(
        "montant",
        netAmountAfterRetention.toFixed(3).replace(".", ",")
      );
    }
  }, [
    paiementValidation.values.modePaiement,
    retentionRate,
    paiementModal,
    selectedBonForPaiement,
  ]);

  const fetchNextLivraison = useCallback(async () => {
    try {
      const numero = await fetchNextLivraisonNumber();
      setNextNumeroLivraison(numero);
    } catch (err) {
      toast.error("Échec de la récupération du numéro de commande");
    }
  }, []);

  const fetchNextNumber = useCallback(async () => {
    try {
      const numero = await fetchNextCommandeNumber();
      setNextNumeroCommande(numero);
    } catch (err) {
      toast.error("Échec de la récupération du numéro de commande");
    }
  }, []);

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
        paiementsData,
        categoriesData,
        fournisseursData,
      ] = await Promise.all([
        fetchBonsCommandeClient(),
        fetchClients(),
        fetchVendeurs(),
        fetchArticles(),
        fetchPaiementsClient(),
        fetchCategories(),
        fetchFournisseurs(),
      ]);

      const bonsWithPayments = bonsData.map((bon) => {
        const relevantPaiements = paiementsData.filter(
          (paiement: PaiementClient) => paiement.bonCommandeClient_id === bon.id
        );

        const totalPaiements = relevantPaiements.reduce(
          (sum: number, paiement: PaiementClient) => {
            let paiementAmount: number;
            if (typeof paiement.montant === "string") {
              paiementAmount = parseFloat(paiement.montant) || 0;
            } else {
              paiementAmount = paiement.montant || 0;
            }
            return sum + paiementAmount;
          },
          0
        );

        // Calculate totals from articles
        let sousTotalHT = 0;
        let totalTax = 0;
        let grandTotal = 0;

        bon.articles.forEach((item: any) => {
          const qty = Number(item.quantite) || 1;
          const priceHT = Number(item.prixUnitaire) || 0;
          const tvaRate = Number(item.tva ?? 0);
          const remiseRate = Number(item.remise || 0);
          const priceTTC =
            Number(item.prix_ttc) || priceHT * (1 + tvaRate / 100);

          const montantHTLigne =
            Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
          const montantTTCLigne = Math.round(qty * priceTTC * 1000) / 1000;
          const taxAmount =
            Math.round((montantTTCLigne - montantHTLigne) * 1000) / 1000;

          sousTotalHT += montantHTLigne;
          totalTax += taxAmount;
          grandTotal += montantTTCLigne;
        });

        // Calculate final total with discount
        let finalTotal = grandTotal;
        const hasDiscount = bon.remise && Number(bon.remise) > 0;
        if (hasDiscount) {
          if (bon.remiseType === "percentage") {
            finalTotal = grandTotal * (1 - Number(bon.remise) / 100);
          } else {
            finalTotal = Number(bon.remise);
          }
        }

        // Fix floating point issues
        sousTotalHT = Math.round(sousTotalHT * 1000) / 1000;
        totalTax = Math.round(totalTax * 1000) / 1000;
        grandTotal = Math.round(grandTotal * 1000) / 1000;
        finalTotal = Math.round(finalTotal * 1000) / 1000;

        // Calculate acompte from payment methods
        const acompteTotal = bon.paymentMethods
          ? bon.paymentMethods.reduce(
              (sum: number, pm: any) => sum + (Number(pm.amount) || 0),
              0
            )
          : 0;

        // Calculate total payé (acompte + paiements supplémentaires)
        const totalPaye = acompteTotal + totalPaiements;

        // Calculate reste à payer (net à payer - total payé)
        let resteAPayer = Math.round((finalTotal - totalPaye) * 1000) / 1000;
        resteAPayer = Math.max(0, resteAPayer);

        return {
          ...bon,
          totalHT: sousTotalHT,
          totalTVA: totalTax,
          totalTTC: grandTotal,
          totalTTCAfterRemise: finalTotal,
          montantPaye: totalPaye, // Total payé (acompte + paiements supplémentaires)
          acompte: acompteTotal, // Acompte seulement
          resteAPayer: resteAPayer,
          hasPayments: totalPaye > 0,
          paiements: relevantPaiements,
        };
      });

      setBonsCommande(bonsWithPayments);
      setFilteredBonsCommande(bonsWithPayments);
      setClients(clientsData);
      setVendeurs(vendeursData);
      setArticles(articlesData);
      setCategories(categoriesData);
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

    if (activeTab === "2") {
      result = result.filter((bon) => bon.status === "Brouillon");
    } else if (activeTab === "3") {
      result = result.filter((bon) => bon.status === "Confirme");
    } else if (activeTab === "4") {
      result = result.filter((bon) => bon.status === "Livre");
    } else if (activeTab === "5") {
      result = result.filter((bon) => bon.status === "Partiellement Livre");
    } else if (activeTab === "6") {
      result = result.filter((bon) => bon.status === "Annule");
    }

    if (startDate && endDate) {
      const start = moment(startDate).startOf("day");
      const end = moment(endDate).endOf("day");
      result = result.filter((bon) => {
        const bonDate = moment(bon.dateCommande);
        return bonDate.isBetween(start, end, null, "[]");
      });
    }

    // Enhanced search functionality to include phone numbers
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        (bon) =>
          bon.numeroCommande.toLowerCase().includes(searchLower) ||
          // Search in regular client
          (bon.client?.raison_sociale &&
            bon.client.raison_sociale.toLowerCase().includes(searchLower)) ||
          // Search in regular client phone numbers
          (bon.client?.telephone1 &&
            bon.client.telephone1.toLowerCase().includes(searchLower)) ||
          (bon.client?.telephone2 &&
            bon.client.telephone2.toLowerCase().includes(searchLower)) ||
          // Search in website client
          (bon.clientWebsite?.nomPrenom &&
            bon.clientWebsite.nomPrenom.toLowerCase().includes(searchLower)) ||
          // Search in website client phone
          (bon.clientWebsite?.telephone &&
            bon.clientWebsite.telephone.toLowerCase().includes(searchLower))
      );
    }

    setFilteredBonsCommande(result);
  }, [activeTab, startDate, endDate, searchText, bonsCommande]);

  const openDetailModal = (bonCommande: BonCommandeClient) => {
    setSelectedBonCommande(bonCommande);
    setDetailModal(true);
  };

  // Add the parseNumericInput function
  const parseNumericInput = (value: string): number => {
    if (!value || value === "") return 0;
    const cleanValue = value.replace(",", ".");
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? 0 : Math.round(numericValue * 1000) / 1000;
  };

  // Add the formatForDisplay function
  const formatForDisplay = (
    value: number | string | undefined | null
  ): string => {
    if (value === undefined || value === null) return "0,000";
    const numericValue =
      typeof value === "string" ? parseNumericInput(value) : Number(value);
    if (isNaN(numericValue)) return "0,000";
    return numericValue.toFixed(3).replace(".", ",");
  };

  // Add these functions before the return statement
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

  const {
    sousTotalHT,
    netHT,
    totalTax,
    grandTotal,
    finalTotal,
    discountAmount,
    retentionMontant,
    netAPayer,
  }: {
    sousTotalHT: number;
    netHT: number;
    totalTax: number;
    grandTotal: number;
    finalTotal: number;
    discountAmount: number;
    retentionMontant: number;
    netAPayer: number;
  } = useMemo(() => {
    if (selectedArticles.length === 0) {
      return {
        sousTotalHT: 0,
        netHT: 0,
        totalTax: 0,
        grandTotal: 0,
        finalTotal: 0,
        discountAmount: 0,
        retentionMontant: 0,
        netAPayer: 0,
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
          Math.round((netHTAfterDiscount + totalTaxAfterDiscount) * 1000) / 1000;
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
  
    // Calculate retention from payment methods with type "retenue" (indication only)
    let retentionMontantValue = 0;
    
    methodesReglement.forEach((pm) => {
      if (pm.method === "retenue") {
        const tauxRetention = pm.tauxRetention || 1;
        const retentionAmount = (finalTotalValue * tauxRetention) / 100;
        retentionMontantValue += Math.round(retentionAmount * 1000) / 1000;
      }
    });
  
    // Calculate net à payer (final total minus retention)
    let netAPayerValue = finalTotalValue - retentionMontantValue;
    netAPayerValue = Math.round(netAPayerValue * 1000) / 1000;
  
    return {
      sousTotalHT: Math.round(sousTotalHTValue * 1000) / 1000,
      netHT: Math.round(displayNetHT * 1000) / 1000,
      totalTax: Math.round(displayTotalTax * 1000) / 1000,
      grandTotal: Math.round(grandTotalValue * 1000) / 1000,
      finalTotal: Math.round(finalTotalValue * 1000) / 1000,
      discountAmount: Math.round(discountAmountValue * 1000) / 1000,
      retentionMontant: retentionMontantValue,
      netAPayer: netAPayerValue,
    };
  }, [
    selectedArticles,
    showRemise,
    globalRemise,
    remiseType,
    editingHT,
    editingTTC,
    methodesReglement,
  ]);

  const handleDelete = async () => {
    if (!bonCommande) return;

    try {
      await deleteBonCommandeClient(bonCommande.id);
      setDeleteModal(false);
      fetchData();
      toast.success("Bon de commande client supprimé avec succès");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Échec de la suppression"
      );
    }
  };

  // Ajouter méthode de règlement
  // Ajouter méthode de règlement
  // REPLACE the current addMethodeReglement function:
  const addMethodeReglement = () => {
    setMethodesReglement((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        method: "especes", // Default method when user adds one
        amount: "", // Empty instead of 000.000
      },
    ]);
  };
  // Supprimer méthode de règlement
  // Supprimer méthode de règlement - ALLOW deleting even single method
  const removeMethodeReglement = (id: string) => {
    setMethodesReglement((prev) => prev.filter((pm) => pm.id !== id));
  };

  // Mettre à jour méthode de règlement
  // REPLACE the current updateMethodeReglement function:
  const updateMethodeReglement = (id: string, field: string, value: any) => {
    setMethodesReglement((prev) =>
      prev.map((pm) => {
        if (pm.id === id) {
          if (field === "amount") {
            // Handle amount validation and formatting
            if (typeof value === "string") {
              // Allow empty string or valid numeric format
              if (value === "" || /^[0-9]*[,.]?[0-9]*$/.test(value)) {
                const formattedValue = value.replace(".", ",");
                const commaCount = (formattedValue.match(/,/g) || []).length;
                if (commaCount <= 1) {
                  return { ...pm, [field]: formattedValue };
                }
              }
              return pm; // Invalid format, don't update
            }
          }
          return { ...pm, [field]: value };
        }
        return pm;
      })
    );
  };

  // Calculer le total des méthodes de règlement
  // REPLACE the current totalReglementAmount calculation:
// REPLACE the current totalReglementAmount calculation with this safer version:
const totalReglementAmount = useMemo(() => {
  return methodesReglement.reduce((sum, pm) => {
    if (!pm || !pm.amount) return sum;
    
    // Handle both string and number types safely
    let amountValue: number;
    if (typeof pm.amount === 'string') {
      if (pm.amount === "") return sum;
      amountValue = parseFloat(pm.amount.replace(",", ".")) || 0;
    } else if (typeof pm.amount === 'number') {
      amountValue = pm.amount;
    } else {
      amountValue = 0;
    }
    
    return sum + amountValue;
  }, 0);
}, [methodesReglement]);




// Add this validation function
const validatePaymentMethods = useCallback(() => {
  if (methodesReglement.length === 0) return true;
  
  const totalPaymentAmount = methodesReglement.reduce((sum, pm) => {
    if (!pm.amount) return sum;
    const amountValue = typeof pm.amount === 'string' 
      ? parseFloat(pm.amount.replace(",", ".")) || 0
      : Number(pm.amount) || 0;
    return sum + amountValue;
  }, 0);

  // Check if any individual payment method exceeds net à payer
  const hasIndividualExceed = methodesReglement.some(pm => {
    if (!pm.amount) return false;
    const amountValue = typeof pm.amount === 'string' 
      ? parseFloat(pm.amount.replace(",", ".")) || 0
      : Number(pm.amount) || 0;
    return amountValue > netAPayer;
  });

  // Check if total exceeds net à payer
  const hasTotalExceed = totalPaymentAmount > netAPayer;

  return !hasIndividualExceed && !hasTotalExceed;
}, [methodesReglement, netAPayer]);


const handleSubmit = async (values: any) => {
  try {
    // ✅ ADD THIS VALIDATION: Block submission if payment amounts exceed net à payer (EXCLUDE RETENTION)
    if (methodesReglement.length > 0) {
      // Filter out retention methods from validation - they are not real payments
      const nonRetentionPayments = methodesReglement.filter(pm => pm.method !== "retenue");
      
      if (nonRetentionPayments.length > 0) {
        const totalPaymentAmount = nonRetentionPayments.reduce((sum, pm) => {
          if (!pm.amount || pm.amount === "") return sum;
          const amountValue = typeof pm.amount === 'string' 
            ? parseFloat(pm.amount.replace(",", ".")) || 0
            : Number(pm.amount) || 0;
          return sum + amountValue;
        }, 0);

        // Check if total payments exceed the final total (BEFORE retention)
        if (totalPaymentAmount > finalTotal) {
          toast.error(`Le total des règlements (${totalPaymentAmount.toFixed(3)} DT) dépasse le montant total (${finalTotal.toFixed(3)} DT)`);
          return;
        }

        // Check if any individual payment method exceeds the final total
        const hasIndividualExceed = nonRetentionPayments.some(pm => {
          if (!pm.amount || pm.amount === "") return false;
          const amountValue = typeof pm.amount === 'string' 
            ? parseFloat(pm.amount.replace(",", ".")) || 0
            : Number(pm.amount) || 0;
          return amountValue > finalTotal;
        });

        if (hasIndividualExceed) {
          toast.error("Le montant d'une méthode de règlement dépasse le montant total");
          return;
        }
      }
    }

    const prepareArticlesForSubmission = (
      articles: typeof selectedArticles
    ) => {
      return articles.map((item) => {
        let finalQuantiteLivree =
          item.quantiteLivree === "" ? 0 : Number(item.quantiteLivree);

        // For BL creation: add new delivery to existing delivered quantity
        if (isCreatingLivraison) {
          const newDelivery = newDeliveryQuantities[item.article_id] || 0;
          finalQuantiteLivree = finalQuantiteLivree + Number(newDelivery);
        }

        return {
          article_id: item.article_id,
          quantite: item.quantite === "" ? 0 : Number(item.quantite),
          quantiteLivree: finalQuantiteLivree,
          prix_unitaire: Number(item.prixUnitaire),
          tva: item.tva,
          remise: item.remise,
          prix_ttc: Number(item.prixTTC),
        };
      });
    };

    const articlesForSubmission = prepareArticlesForSubmission(selectedArticles);

    // Check if any article has quantity 0 or empty
    const hasEmptyQuantities = articlesForSubmission.some(
      (item) => item.quantite <= 0
    );
    if (hasEmptyQuantities) {
      toast.error(
        "Tous les articles doivent avoir une quantité supérieure à 0"
      );
      return;
    }

    // ✅ ONLY FOR BL CREATION: Validate new deliveries
    if (isCreatingLivraison) {
      // Check if user entered any delivery quantities
      const hasAnyNewDelivery = Object.values(newDeliveryQuantities).some(
        (value) => value !== "" && Number(value) > 0
      );

      if (!hasAnyNewDelivery) {
        toast.error("Veuillez spécifier les quantités à livrer");
        return;
      }

      // Validate no over-delivery
      const hasOverDelivery = articlesForSubmission.some(
        (item) => item.quantiteLivree > item.quantite
      );
      if (hasOverDelivery) {
        toast.error(
          "La quantité totale livrée ne peut pas dépasser la quantité commandée"
        );
        return;
      }
    }

    // ✅ Calculate if we should auto-generate BL (your existing logic)
    const hasDeliveredQuantities = articlesForSubmission.some(
      (item) => item.quantiteLivree > 0
    );

    let shouldGenerateBL = hasDeliveredQuantities;

    if (isEdit && bonCommande) {
      const existingArticles = bonCommande.articles || [];
      let hasNewDeliveries = false;

      articlesForSubmission.forEach((newItem) => {
        const existingItem = existingArticles.find(
          (item: any) => item.article.id === newItem.article_id
        );
        if (existingItem) {
          const existingQtyLivree = existingItem.quantiteLivree || 0;
          const newQtyLivree = newItem.quantiteLivree || 0;

          if (newQtyLivree > existingQtyLivree) {
            hasNewDeliveries = true;
          }
        }
      });

      shouldGenerateBL = hasNewDeliveries;
    }

    // ✅ Calculate totals to save (same logic as Facture Client)
    let sousTotalHTValue = 0;
    let totalTaxValue = 0;
    let grandTotalValue = 0;

    selectedArticles.forEach((article) => {
      const qty = article.quantite === "" ? 0 : Number(article.quantite) || 0;
      const tvaRate = Number(article.tva) || 0;
      const remiseRate = Number(article.remise) || 0;

      let priceHT = Number(article.prixUnitaire) || 0;
      let priceTTC = Number(article.prixTTC) || 0;

      // Use editing values if they exist
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
        const editingValue = parseNumericInput(
          editingTTC[article.article_id]
        );
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

      const montantHTLigne =
        Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
      const montantTTCLigne = Math.round(qty * priceTTC * 1000) / 1000;
      const taxAmount =
        Math.round((montantTTCLigne - montantHTLigne) * 1000) / 1000;

      sousTotalHTValue += montantHTLigne;
      totalTaxValue += taxAmount;
      grandTotalValue += montantTTCLigne;
    });

    // Round accumulated values
    sousTotalHTValue = Math.round(sousTotalHTValue * 1000) / 1000;
    totalTaxValue = Math.round(totalTaxValue * 1000) / 1000;
    grandTotalValue = Math.round(grandTotalValue * 1000) / 1000;

    let finalTotalValue = grandTotalValue;
    const hasDiscount = globalRemise && Number(globalRemise) > 0;

    if (hasDiscount) {
      if (remiseType === "percentage") {
        finalTotalValue = grandTotalValue * (1 - Number(globalRemise) / 100);
      } else {
        finalTotalValue = Number(globalRemise);
      }
    }

    finalTotalValue = Math.round(finalTotalValue * 1000) / 1000;

    // ✅ SIMPLIFIED: Send all payment methods including "retenue"
    // The backend will handle the retention logic
    const processedMethodesReglement = methodesReglement
      .filter((pm) => pm.method && (pm.method === "retenue" || pm.amount)) // Allow retenue without amount validation
      .map((pm) => {
        let amountValue: number;
        if (typeof pm.amount === 'string') {
          amountValue = parseFloat(pm.amount.replace(",", ".")) || 0;
        } else if (typeof pm.amount === 'number') {
          amountValue = pm.amount;
        } else {
          amountValue = 0;
        }
        
        // For retention method, send the rate and amount as 0 (not a real payment)
        if (pm.method === "retenue") {
          return {
            method: pm.method,
            amount: 0, // Send 0 as amount since it's not a real payment
            numero: pm.numero || "",
            banque: pm.banque || "",
            dateEcheance: pm.dateEcheance || "",
            tauxRetention: pm.tauxRetention || 1
          };
        }
        
        return {
          method: pm.method,
          amount: amountValue,
          numero: pm.numero || "",
          banque: pm.banque || "",
          dateEcheance: pm.dateEcheance || "",
        };
      });

    if (isCreatingLivraison) {
      const livraisonData = {
        numeroLivraison: values.numeroLivraison,
        dateLivraison: values.dateLivraison,
        client_id: selectedClient?.id ?? null,
        vendeur_id: values.vendeur_id,
        status: values.status,
        notes: values.notes,
        taxMode,
        remise: globalRemise,
        remiseType: remiseType,
        bonCommandeClient_id: bonCommande?.id,
        articles: articlesForSubmission,
        totalHT: sousTotalHTValue,
        totalTVA: totalTaxValue,
        totalTTC: finalTotalValue,
        totalTTCAfterRemise: finalTotalValue,
      };

      await createBonLivraison(livraisonData);
      toast.success("Bon de livraison créé avec succès");
      setModal(false);
      setDetailModal(false);
    } else {
      const bonCommandeData = {
        ...values,
        taxMode,
        articles: articlesForSubmission,
        remise: globalRemise,
        remiseType: remiseType,
        autoGenerateLivraison: shouldGenerateBL,
        totalHT: sousTotalHTValue,
        totalTVA: totalTaxValue,
        totalTTC: grandTotalValue,
        totalTTCAfterRemise: finalTotalValue,
        paymentMethods: processedMethodesReglement, // Send all methods including retenue
        totalPaymentAmount: totalReglementAmount,
        espaceNotes: espaceNotes,
      };

      if (isEdit && bonCommande) {
        await updateBonCommandeClient(bonCommande.id, bonCommandeData);
        toast.success("Bon de commande client mis à jour avec succès");
      } else {
        await createBonCommandeClient(bonCommandeData);
        toast.success("Bon de commande client créé avec succès");
      }
    }

    setModal(false);
    setNewDeliveryQuantities({});

    // ✅ RÉINITIALISER LES METHODES DE REGLEMENT APRÈS SOUMISSION
    setMethodesReglement([]); // Reset to empty array
    setEspaceNotes("");

    fetchData();
  } catch (err) {
    console.error("Error in handleSubmit:", err);
    toast.error(err instanceof Error ? err.message : "Échec de l'opération");
  }
};

  useEffect(() => {
    if (modal) {
      if (!isEdit && !isCreatingLivraison) {
        fetchNextNumber(); // Fetch bon commande number
      } else if (isCreatingLivraison) {
        fetchNextLivraison(); // Fetch livraison number
      }
    }
  }, [modal, isEdit, isCreatingLivraison, fetchNextNumber, fetchNextLivraison]);

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      numeroCommande: isEdit
        ? bonCommande?.numeroCommande || ""
        : isCreatingLivraison
        ? ""
        : nextNumeroCommande,
      numeroLivraison: isCreatingLivraison
        ? nextNumeroLivraison // Use the fetched livraison number
        : "",
      dateLivraison: isCreatingLivraison
        ? moment().format("YYYY-MM-DD")
        : bonCommande?.dateCommande
        ? moment(bonCommande.dateCommande).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"),
      client_id: bonCommande?.client?.id ?? "",
      vendeur_id: bonCommande?.vendeur?.id ?? "",
      dateCommande: bonCommande?.dateCommande
        ? moment(bonCommande.dateCommande).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"),
      status: bonCommande?.status ?? "Confirme",
      notes: bonCommande?.notes ?? "",
      isCreatingLivraison: isCreatingLivraison,
    },
    validationSchema: Yup.object().shape({
      dateCommande: Yup.date().when("isCreatingLivraison", {
        is: false,
        then: (schema) => schema.required("La date de commande est requise"),
      }),
      dateLivraison: Yup.date().when("isCreatingLivraison", {
        is: true,
        then: (schema) => schema.required("La date de livraison est requise"),
      }),
      numeroCommande: Yup.string().when("isCreatingLivraison", {
        is: false,
        then: (schema) => schema.required("Le numéro de commande est requis"),
      }),
      numeroLivraison: Yup.string().when("isCreatingLivraison", {
        is: true,
        then: (schema) => schema.required("Le numéro de livraison est requis"),
      }),
      client_id: Yup.number().required("Le client est requis"),
      vendeur_id: Yup.number().required("Le vendeur est requis"),
      //status: Yup.string().required("Le statut est requis"),
      isCreatingLivraison: Yup.boolean(),
    }),
    onSubmit: handleSubmit,
  });

  // In the toggleModal function, REPLACE the payment methods reset:
  const toggleModal = useCallback(() => {
    if (modal) {
      setModal(false);
      setBonCommande(null);
      setSelectedArticles([]);
      setSelectedClient(null);
      setGlobalRemise(0);
      setRemiseType("percentage");
      setShowRemise(false);
      setIsCreatingLivraison(false);
      setNewDeliveryQuantities({});

      // Reset payment methods to empty array
      setMethodesReglement([]);
      setEspaceNotes("");

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
      const initialTTC =
        article.puv_ttc || initialHT * (1 + (article.tva || 0) / 100); // Use puv_ttc if available

      setSelectedArticles([
        ...selectedArticles,
        {
          article_id: article.id,
          quantite: "", // Empty for user to fill
          prixUnitaire: initialHT,
          tva: initialTVA,
          remise: 0,
          prixTTC: Math.round(initialTTC * 1000) / 1000, // Use TTC from article
          articleDetails: article,
          quantiteLivree: "", // ✅ This should be "" to match the quantite field
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

          // If quantite changes, update quantiteLivree if it exceeds new quantite
          if (field === "quantite") {
            const newQuantite = value === "" ? 0 : Number(value);
            const currentQuantiteLivree = Number(item.quantiteLivree) || 0;

            if (currentQuantiteLivree > newQuantite) {
              updatedItem.quantiteLivree = newQuantite;
            }
          }

          // If quantiteLivree changes, ensure it doesn't exceed quantite
          if (field === "quantiteLivree") {
            const quantiteCommandee = Number(item.quantite) || 0;
            const newQuantiteLivree =
              value === ""
                ? 0
                : Math.max(0, Math.min(Number(value), quantiteCommandee));
            updatedItem.quantiteLivree = newQuantiteLivree;
          }

          // Recalculate TTC when HT changes
          if (field === "prixUnitaire") {
            const currentHT = value;
            const currentTVA = item.tva || 0;

            let newPriceTTC = Number(currentHT);
            if (currentTVA > 0) {
              newPriceTTC = Number(currentHT) * (1 + currentTVA / 100);
            }

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

            updatedItem.prixUnitaire = Math.round(newPriceHT * 1000) / 1000;
          }

          // Recalculate both when TVA changes
          if (field === "tva") {
            const currentTVA = value === "" ? 0 : Number(value);
            const currentHT = item.prixUnitaire;

            let newPriceTTC = currentHT;
            if (currentTVA > 0) {
              newPriceTTC = currentHT * (1 + currentTVA / 100);
            }

            updatedItem.prixTTC = Math.round(newPriceTTC * 1000) / 1000;

            // Clear editing states
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

          return updatedItem;
        }
        return item;
      })
    );

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
    status?:
      | "Brouillon"
      | "Confirme"
      | "Livre"
      | "Annule"
      | "Partiellement Livre";
  }) => {
    const statusConfig = {
      Brouillon: {
        bgClass: "bg-warning",
        textClass: "text-warning",
        icon: "ri-draft-line",
      },
      Confirme: {
        bgClass: "bg-primary",
        textClass: "text-primary",
        icon: "ri-checkbox-circle-line",
      },
      Livre: {
        bgClass: "bg-success",
        textClass: "text-success",
        icon: "ri-truck-line",
      },
      Annule: {
        bgClass: "bg-danger",
        textClass: "text-danger",
        icon: "ri-close-circle-line",
      },
      "Partiellement Livre": {
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

  return (
    <div className="page-content">
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDelete}
        onCloseClick={() => setDeleteModal(false)}
      />

      <Container fluid>
        <BreadCrumb title="Bons de Commande Client" pageTitle="Commandes" />

        <Row>
          <Col lg={12}>
            <Card id="bonCommandeList">
              <CardHeader className="card-header border-0">
                <Row className="align-items-center gy-3">
                  <div className="col-sm">
                    <h5 className="card-title mb-0">
                      Gestion des Bons de Commande Client
                    </h5>
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
                        <i className="ri-add-line align-bottom me-1"></i>{" "}
                        Ajouter Bon
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
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => setActiveTab("3")}
                  >
                    <i className="ri-checkbox-circle-line me-1 align-bottom"></i>{" "}
                    Confirmé
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "4" })}
                    onClick={() => setActiveTab("4")}
                  >
                    <i className="ri-truck-line me-1 align-bottom"></i> Livré
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "5" })}
                    onClick={() => setActiveTab("5")}
                  >
                    <i className="ri-truck-line me-1 align-bottom"></i>{" "}
                    Partiellement Livré
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "6" })}
                    onClick={() => setActiveTab("6")}
                  >
                    <i className="ri-close-circle-line me-1 align-bottom"></i>{" "}
                    Annulé
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
                    columns={[
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
                        cell: (cell: any) =>
                          moment(cell.getValue()).format("DD MMM YYYY"),
                      },
                      // In your columns array, update just the Client column:
                      {
                        header: "Client",
                        accessorKey: "client",
                        enableColumnFilter: false,
                        cell: (cell: any) => {
                          const bonCommande = cell.row.original;

                          // Regular client
                          if (bonCommande.client) {
                            return `${bonCommande.client.raison_sociale}`;
                          }

                          // Website client
                          if (bonCommande.clientWebsite) {
                            return (
                              <div>
                                {bonCommande.clientWebsite.nomPrenom}
                                <span className="badge bg-info ms-1">Web</span>
                              </div>
                            );
                          }

                          return "-";
                        },
                      },
                      {
                        header: "Vendeur",
                        accessorKey: "vendeur",
                        enableColumnFilter: false,
                        cell: (cell: any) =>
                          `${cell.getValue()?.nom || ""} ${
                            cell.getValue()?.prenom || ""
                          }`,
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
                        accessorKey: "totalTTC",
                        enableColumnFilter: false,
                        cell: (cell: any) => {
                          const total = Number(cell.getValue()) || 0;
                          return `${total.toFixed(3)} DT`;
                        },
                      },
                      {
                        header: "Total Après Remise",
                        accessorKey: "totalTTCAfterRemise",
                        enableColumnFilter: false,
                        cell: (cell: any) => {
                          const total = Number(cell.getValue()) || 0;
                          return `${total.toFixed(3)} DT`;
                        },
                      },
                      {
                        header: "Payé",
                        accessorKey: "montantPaye",
                        enableColumnFilter: false,
                        cell: (cell: any) =>
                          `${Number(cell.getValue()).toFixed(3)} DT`,
                      },
                      {
                        header: "Reste à payer",
                        accessorKey: "resteAPayer",
                        enableColumnFilter: false,
                        cell: (cell: any) =>
                          `${Number(cell.getValue()).toFixed(3)} DT`,
                      },
                      {
                        header: "Statut",
                        accessorKey: "status",
                        enableColumnFilter: false,
                        cell: (cell: any) => (
                          <StatusBadge status={cell.getValue()} />
                        ),
                      },
                      {
                        header: "Action",
                        cell: (cellProps: any) => {
                          const bon = cellProps.row.original;
                          return (
                            <ul className="list-inline hstack gap-2 mb-0">
                              <li className="list-inline-item">
                                <Link
                                  to="#"
                                  className="text-info d-inline-block"
                                  onClick={() =>
                                    openPdfModal(cellProps.row.original)
                                  }
                                >
                                  <i className="ri-file-pdf-line fs-16"></i>
                                </Link>
                              </li>
                              <li className="list-inline-item">
                                <Link
                                  to="#"
                                  className="text-success d-inline-block"
                                  onClick={() => openPaiementModal(bon)}
                                >
                                  <i className="ri-money-dollar-circle-line fs-16"></i>
                                </Link>
                              </li>
                              <li className="list-inline-item edit">
                                <Link
                                  to="#"
                                  className="text-primary d-inline-block edit-item-btn"
                                  // In the columns action cell, update the edit click handler:
                                  // In the columns action cell, update the edit click handler:
                                  onClick={() => {
                                    setBonCommande(cellProps.row.original);
                                    setSelectedArticles(
                                      cellProps.row.original.articles.map(
                                        (item: any) => ({
                                          article_id: item.article.id,
                                          quantite: item.quantite,
                                          quantiteLivree:
                                            item.quantiteLivree || "", // ✅ Load existing delivered quantity
                                          prixUnitaire: parseFloat(
                                            item.prixUnitaire
                                          ),
                                          prixTTC:
                                            parseFloat(item.prix_ttc) ||
                                            parseFloat(item.prixUnitaire) *
                                              (1 + (item.tva || 0) / 100),

                                          tva:
                                            item.tva != null
                                              ? parseFloat(item.tva)
                                              : null,
                                          remise:
                                            item.remise != null
                                              ? parseFloat(item.remise)
                                              : null,
                                          articleDetails: item.article,
                                        })
                                      )
                                    );
                                    setSelectedClient(
                                      cellProps.row.original.client || null
                                    );
                                    setGlobalRemise(
                                      cellProps.row.original.remise || 0
                                    );
                                    // Dans le bouton d'édition, ajouter :
                                    // In the edit button onClick handler:
                                    setMethodesReglement(
                                      cellProps.row.original.paymentMethods &&
                                        cellProps.row.original.paymentMethods
                                          .length > 0
                                        ? cellProps.row.original.paymentMethods.map(
                                            (pm: any, index: number) => ({
                                              id: pm.id || `edit-${index}`,
                                              method: pm.method,
                                              amount: pm.amount ? 
                                              (typeof pm.amount === 'number' ? 
                                                pm.amount.toFixed(3).replace(".", ",") : // Convert number to string format
                                                String(pm.amount)) 
                                              : "",                                              numero: pm.numero || "",
                                              banque: pm.banque || "",
                                              dateEcheance:
                                                pm.dateEcheance || "",
                                            })
                                          )
                                        : [] // Empty array if no saved payments - will show only the button
                                    );
                                    setRemiseType(
                                      cellProps.row.original.remiseType ||
                                        "percentage"
                                    );
                                    setShowRemise(
                                      (cellProps.row.original.remise || 0) > 0
                                    );
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
                                  onClick={() =>
                                    openDetailModal(cellProps.row.original)
                                  }
                                >
                                  <i className="ri-eye-line fs-16"></i>
                                </Link>
                              </li>
                            </ul>
                          );
                        },
                      },
                    ]}
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
                          Bon de Commande #{selectedBonCommande?.numeroCommande}
                        </h4>
                        <small className="text-muted">
                          {moment(selectedBonCommande?.dateCommande).format(
                            "DD MMM YYYY"
                          )}
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
                                    {selectedBonCommande.clientWebsite ? (
                                      <>
                                        <h5 className="mb-1">
                                          {
                                            selectedBonCommande.clientWebsite
                                              .nomPrenom
                                          }
                                        </h5>
                                        <Badge color="info" className="mb-2">
                                          Client Site Web
                                        </Badge>
                                        <p className="text-muted mb-1">
                                          <i className="ri-phone-line me-1"></i>
                                          {
                                            selectedBonCommande.clientWebsite
                                              .telephone
                                          }
                                        </p>
                                        {selectedBonCommande.clientWebsite
                                          .email && (
                                          <p className="text-muted mb-1">
                                            <i className="ri-mail-line me-1"></i>
                                            {
                                              selectedBonCommande.clientWebsite
                                                .email
                                            }
                                          </p>
                                        )}
                                        <p className="text-muted mb-0">
                                          <i className="ri-map-pin-line me-1"></i>
                                          {
                                            selectedBonCommande.clientWebsite
                                              .adresse
                                          }
                                          {selectedBonCommande.clientWebsite
                                            .ville &&
                                            `, ${selectedBonCommande.clientWebsite.ville}`}
                                        </p>
                                      </>
                                    ) : selectedBonCommande.client ? (
                                      <>
                                        <h5 className="mb-1">
                                          {
                                            selectedBonCommande.client
                                              .raison_sociale
                                          }
                                        </h5>
                                        <p className="text-muted mb-1">
                                          <i className="ri-phone-line me-1"></i>
                                          {
                                            selectedBonCommande.client
                                              .telephone1
                                          }
                                        </p>
                                        <p className="text-muted mb-0">
                                          <i className="ri-map-pin-line me-1"></i>
                                          {selectedBonCommande.client.adresse}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="text-muted mb-0">
                                        Aucun client associé
                                      </p>
                                    )}
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
                                  Informations Commande
                                </h6>
                                <div className="row g-2">
                                  <div className="col-6">
                                    <p className="mb-2">
                                      <span className="text-muted d-block">
                                        Vendeur:
                                      </span>
                                      <strong>
                                        {selectedBonCommande.vendeur?.nom}{" "}
                                        {selectedBonCommande.vendeur?.prenom}
                                      </strong>
                                    </p>
                                  </div>
                                  <div className="col-6">
                                    <p className="mb-2">
                                      <span className="text-muted d-block">
                                        Statut:
                                      </span>
                                      <StatusBadge
                                        status={selectedBonCommande.status}
                                      />
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
                              <p className="mb-0 text-muted">
                                {selectedBonCommande.notes}
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
                                    <th className="text-end">Qté Com</th>
                                    <th className="text-end">Qté Liv</th>
                                    <th className="text-end">Reste</th>
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
                                  {selectedBonCommande.articles.map(
                                    (item, index) => {
                                      const quantiteCommandee =
                                        Number(item.quantite) || 0;
                                      const quantiteLivree =
                                        Number(item.quantiteLivree) || 0;
                                      const quantiteRestante =
                                        quantiteCommandee - quantiteLivree;
                                      const priceHT =
                                        Number(item.prixUnitaire) || 0;
                                      const tvaRate = Number(item.tva ?? 0);
                                      const remiseRate = Number(
                                        item.remise || 0
                                      );

                                      // Use the same logic as bon livraison - use puv_ttc from article

                                      const priceTTC =
                                        Number(item.prix_ttc) !== 0
                                          ? Number(item.prix_ttc)
                                          : Number(item.article?.puv_ttc) ||
                                            priceHT * (1 + tvaRate / 100);

                                      const montantSousTotalHT =
                                        Math.round(
                                          quantiteCommandee * priceHT * 1000
                                        ) / 1000;
                                      const montantNetHT =
                                        Math.round(
                                          quantiteCommandee *
                                            priceHT *
                                            (1 - remiseRate / 100) *
                                            1000
                                        ) / 1000;
                                      const montantTTCLigne =
                                        Math.round(
                                          quantiteCommandee * priceTTC * 1000
                                        ) / 1000;

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
                                            {quantiteCommandee}
                                          </td>
                                          <td className="text-end">
                                            <Badge
                                              color={
                                                quantiteLivree === 0
                                                  ? "secondary"
                                                  : quantiteLivree ===
                                                    quantiteCommandee
                                                  ? "success"
                                                  : "warning"
                                              }
                                            >
                                              {quantiteLivree}
                                            </Badge>
                                          </td>
                                          <td className="text-end">
                                            <Badge
                                              color={
                                                quantiteRestante > 0
                                                  ? "warning"
                                                  : "success"
                                              }
                                            >
                                              {quantiteRestante}
                                            </Badge>
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

                                    selectedBonCommande.articles.forEach(
                                      (article) => {
                                        const qty =
                                          Number(article.quantite) || 0;
                                        const tvaRate =
                                          Number(article.tva) || 0;
                                        const remiseRate =
                                          Number(article.remise) || 0;

                                        const priceHT =
                                          Number(article.prixUnitaire) || 0;
                                        const priceTTC =
                                          Number(article.prix_ttc) !== 0
                                            ? Number(article.prix_ttc)
                                            : Number(
                                                article.article?.puv_ttc
                                              ) ||
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
                                      Number(selectedBonCommande.remise) || 0;
                                    const remiseTypeValue =
                                      selectedBonCommande.remiseType ||
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

                                    // Calculer l'acompte (total des méthodes de paiement)
                                    const acompteTotal =
                                      selectedBonCommande.paymentMethods
                                        ? selectedBonCommande.paymentMethods.reduce(
                                            (sum: number, pm: any) =>
                                              sum + (Number(pm.amount) || 0),
                                            0
                                          )
                                        : 0;

                                    // FIXED: totalPaye is already calculated in fetchData, don't add acompte again
                                    const totalPaye =
                                      selectedBonCommande.montantPaye || 0;

                                    // FIXED: Use the exact same resteAPayer calculation as useMemo table
                                    const resteAPayerValue = Math.max(
                                      0,
                                      finalTotalValue - totalPaye
                                    );

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

                                          {/* Affichage de l'acompte */}
                                          {acompteTotal > 0 && (
                                            <tr className="real-time-update">
                                              <th className="text-end text-muted fs-6">
                                                Acompte:
                                              </th>
                                              <td className="text-end text-success fw-bold fs-6">
                                                - {acompteTotal.toFixed(3)} DT
                                              </td>
                                            </tr>
                                          )}

                                          {/* Affichage du reste à payer */}
                                          <tr className="final-total real-time-update border-top border-primary">
                                            <th className="text-end fs-5 text-primary">
                                              RESTE À PAYER:
                                            </th>
                                            <td className="text-end fw-bold fs-5 text-primary">
                                              {resteAPayerValue.toFixed(3)} DT
                                            </td>
                                          </tr>
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
                          // In the "Créer Bon Livraison" button onClick, update the setSelectedArticles part:
                          setSelectedArticles(
                            selectedBonCommande.articles.map((item) => ({
                              article_id: item.article?.id || 0,
                              quantite: item.quantite,
                              prixUnitaire:
                                typeof item.prixUnitaire === "string"
                                  ? parseFloat(item.prixUnitaire)
                                  : item.prixUnitaire,
                              // ✅ FIXED: Use prix_ttc from bon commande database, not article.puv_ttc
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
                              quantiteLivree: item.quantiteLivree || 0,
                            }))
                          );
                          setSelectedClient(selectedBonCommande.client || null);
                          setGlobalRemise(selectedBonCommande.remise || 0);
                          setRemiseType(
                            selectedBonCommande.remiseType || "percentage"
                          );
                          setShowRemise((selectedBonCommande.remise || 0) > 0);
                          setIsCreatingLivraison(true);
                          setIsEdit(false);
                          validation.setValues({
                            ...validation.values,
                            numeroLivraison: nextNumeroLivraison,
                            client_id: selectedBonCommande.client?.id ?? "",
                            vendeur_id: selectedBonCommande.vendeur?.id ?? "",
                            dateLivraison: moment().format("YYYY-MM-DD"),
                            status: "Brouillon",
                            notes: selectedBonCommande.notes ?? "",
                            isCreatingLivraison: true,
                          });
                          setModal(true);
                        }
                      }}
                      className="btn-invoice btn-invoice-success me-2"
                    >
                      <i className="ri-truck-line me-2"></i> Créer Bon Livraison
                    </Button>

                    <Button
                      color="primary"
                      onClick={() =>
                        selectedBonCommande && openPdfModal(selectedBonCommande)
                      }
                      className="btn-invoice btn-invoice-primary me-2"
                      disabled={!selectedBonCommande}
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
                        <i className="ri-file-list-3-line text-primary fs-4"></i>
                      </div>
                      <div>
                        <h4 className="mb-0 fw-bold text-dark">
                          {isCreatingLivraison
                            ? "Créer Bon de Livraison"
                            : isEdit
                            ? "Modifier Bon de Commande Client"
                            : "Créer Bon de Commande Client"}
                        </h4>
                        <small className="text-muted">
                          {isCreatingLivraison
                            ? "Créer un bon de livraison à partir de cette commande"
                            : isEdit
                            ? "Modifier les détails du bon de commande existant"
                            : "Créer un nouveau bon de commande client"}
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
                            {isCreatingLivraison ? (
                              <Col md={4}>
                                <div className="mb-3">
                                  <Label className="form-label-lg fw-semibold">
                                    Numéro de Livraison*
                                  </Label>
                                  <Input
                                    name="numeroLivraison"
                                    value={validation.values.numeroLivraison}
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    invalid={
                                      validation.touched.numeroLivraison &&
                                      !!validation.errors.numeroLivraison
                                    }
                                    readOnly={!isEdit}
                                    className="form-control-lg"
                                    placeholder="LIV-2024-001"
                                  />
                                  <FormFeedback className="fs-6">
                                    {validation.errors.numeroLivraison}
                                  </FormFeedback>
                                </div>
                              </Col>
                            ) : (
                              <Col md={4}>
                                <div className="mb-3">
                                  <Label className="form-label-lg fw-semibold">
                                    Numéro de Commande*
                                  </Label>
                                  <Input
                                    name="numeroCommande"
                                    value={validation.values.numeroCommande}
                                    onChange={validation.handleChange}
                                    onBlur={validation.handleBlur}
                                    invalid={
                                      validation.touched.numeroCommande &&
                                      !!validation.errors.numeroCommande
                                    }
                                    readOnly={!isEdit}
                                    className="form-control-lg"
                                    placeholder="CMD-2024-001"
                                  />
                                  <FormFeedback className="fs-6">
                                    {validation.errors.numeroCommande}
                                  </FormFeedback>
                                </div>
                              </Col>
                            )}

                            <Col md={4}>
                              <div className="mb-3">
                                <Label className="form-label-lg fw-semibold">
                                  {isCreatingLivraison
                                    ? "Date de Livraison*"
                                    : "Date de Commande*"}
                                </Label>
                                <Input
                                  className="form-control-lg"
                                  type="date"
                                  name={
                                    isCreatingLivraison
                                      ? "dateLivraison"
                                      : "dateCommande"
                                  }
                                  value={
                                    isCreatingLivraison
                                      ? validation.values.dateLivraison
                                      : validation.values.dateCommande
                                  }
                                  onChange={validation.handleChange}
                                  onBlur={validation.handleBlur}
                                  invalid={
                                    isCreatingLivraison
                                      ? validation.touched.dateLivraison &&
                                        !!validation.errors.dateLivraison
                                      : validation.touched.dateCommande &&
                                        !!validation.errors.dateCommande
                                  }
                                />
                                <FormFeedback>
                                  {isCreatingLivraison
                                    ? typeof validation.errors.dateLivraison ===
                                      "string"
                                      ? validation.errors.dateLivraison
                                      : ""
                                    : typeof validation.errors.dateCommande ===
                                      "string"
                                    ? validation.errors.dateCommande
                                    : ""}
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
                                      !!selectedClient || isCreatingLivraison
                                    }
                                    className="form-control-lg pe-10"
                                  />

                                  {/* Clear button when client is selected */}
                                  {selectedClient && !isCreatingLivraison && (
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
                                  {!selectedClient && !isCreatingLivraison && (
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
                                {!isCreatingLivraison &&
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
                                  onBlur={validation.handleBlur}
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
                              <Label
                                for="showRemise"
                                check
                                className="form-check-label fw-semibold fs-6"
                              >
                                Appliquer une remise
                              </Label>
                            </div>
                          </div>

                          {showRemise && (
                            <Row className="g-3 mt-3">
                              <Col md={4}>
                                <div className="mb-3">
                                  <Label className="form-label-lg fw-semibold">
                                    Type de remise
                                  </Label>
                                  <Input
                                    type="select"
                                    value={remiseType}
                                    onChange={(e) =>
                                      setRemiseType(
                                        e.target.value as "percentage" | "fixed"
                                      )
                                    }
                                    className="form-control-lg"
                                  >
                                    <option value="percentage">
                                      Pourcentage (%)
                                    </option>
                                    <option value="fixed">
                                      Montant fixe (DT)
                                    </option>
                                  </Input>
                                </div>
                              </Col>
                              <Col md={4}>
                                <div className="mb-3">
                                  <Label className="form-label-lg fw-semibold">
                                    {remiseType === "percentage"
                                      ? "Pourcentage de remise"
                                      : "Montant de remise (DT)"}
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
                                      globalRemise === 0 ? "" : globalRemise
                                    }
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
                                    placeholder={
                                      remiseType === "percentage"
                                        ? "0-100%"
                                        : "Montant en DT"
                                    }
                                    className="form-control-lg"
                                  />
                                </div>
                              </Col>
                              <Col md={4}>
                                {showRemise && globalRemise > 0 && (
                                  <div className="p-3 bg-primary bg-opacity-10 rounded border">
                                    <div className="text-center">
                                      <small className="text-muted d-block">
                                        Remise appliquée
                                      </small>
                                      <strong className="fs-5 text-primary">
                                        {remiseType === "percentage"
                                          ? `${globalRemise}%`
                                          : `${Number(globalRemise).toFixed(
                                              3
                                            )} DT`}
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
                            <div className="search-box position-relative">
                              <Input
                                type="text"
                                placeholder="Rechercher article..."
                                value={articleSearch}
                                onChange={(e) =>
                                  setArticleSearch(e.target.value)
                                }
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
                            {articleSearch.length >= 1 && (
                              <div
                                className="search-results mt-2 border rounded shadow-sm"
                                style={{
                                  maxHeight: "300px",
                                  overflowY: "auto",
                                  position: "relative",
                                  zIndex: 1000,
                                  backgroundColor: "white",
                                }}
                              >
                                {filteredArticles.length > 0 ? (
                                  <ul className="list-group list-group-flush">
                                    {filteredArticles.map((article) => (
                                      <li
                                        key={article.id}
                                        className="list-group-item list-group-item-action"
                                        onClick={() => {
                                          handleAddArticle(
                                            article.id.toString()
                                          );
                                          setArticleSearch("");
                                          setFilteredArticles([]);
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
                                        }}
                                      >
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div className="flex-grow-1">
                                            <strong className="d-block">
                                              {article.designation}
                                            </strong>
                                            <small className="text-muted">
                                              Réf: {article.reference} | Stock:{" "}
                                              {article.qte} | HT:{" "}
                                              {(
                                                Number(article.puv_ht) || 0
                                              ).toFixed(3)}{" "}
                                              DT
                                            </small>
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

                          {/* Articles Table */}
                          {/* Articles Table */}
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
                                          width: "8%",
                                          minWidth: "80px",
                                        }}
                                      >
                                        Référence
                                      </th>
                                      <th
                                        style={{
                                          width: "6%",
                                          minWidth: "60px",
                                        }}
                                      >
                                        Qté Com
                                      </th>

                                      {/* ✅ ALWAYS SHOW delivery columns - even in creation mode */}
                                      <th
                                        style={{
                                          width: "6%",
                                          minWidth: "60px",
                                        }}
                                      >
                                        Qté Liv
                                      </th>
                                      <th
                                        style={{
                                          width: "6%",
                                          minWidth: "60px",
                                        }}
                                      >
                                        Reste
                                      </th>

                                      <th
                                        style={{
                                          width: "10%",
                                          minWidth: "100px",
                                        }}
                                      >
                                        Prix HT
                                      </th>
                                      <th
                                        style={{
                                          width: "10%",
                                          minWidth: "100px",
                                        }}
                                      >
                                        Prix TTC
                                      </th>
                                      <th
                                        style={{
                                          width: "8%",
                                          minWidth: "70px",
                                        }}
                                      >
                                        TVA (%)
                                      </th>
                                      <th
                                        style={{
                                          width: "9%",
                                          minWidth: "90px",
                                        }}
                                      >
                                        Total HT
                                      </th>
                                      <th
                                        style={{
                                          width: "9%",
                                          minWidth: "90px",
                                        }}
                                      >
                                        Total TTC
                                      </th>
                                      <th
                                        style={{
                                          width: "4%",
                                          minWidth: "50px",
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

                                      const qtyCommandee =
                                        Number(item.quantite) || 0;
                                      const qtyLivree =
                                        Number(item.quantiteLivree) || 0;
                                      const qtyRestante =
                                        qtyCommandee - qtyLivree;

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
                                        qtyCommandee * priceHT
                                      ).toFixed(3);
                                      const montantTTCLigne = (
                                        qtyCommandee * priceTTC
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
                                          <td style={{ width: "8%" }}>
                                            <Badge
                                              color="light"
                                              className="text-dark text-xs"
                                            >
                                              {article?.reference}
                                            </Badge>
                                          </td>
                                          <td style={{ width: "6%" }}>
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
                                                fontSize: "0.8rem",
                                                padding: "0.25rem",
                                                backgroundColor:
                                                  isCreatingLivraison
                                                    ? "#f8f9fa"
                                                    : "white", // Optional: change background color to indicate read-only
                                              }}
                                              readOnly={isCreatingLivraison} // ✅ MAKE READ-ONLY DURING BL CREATION
                                            />
                                          </td>

                                          {/* ✅ ALWAYS SHOW delivery columns - even in creation mode */}
                                          <td style={{ width: "6%" }}>
                                            <Input
                                              type="number"
                                              min="0"
                                              max={qtyCommandee}
                                              step="1"
                                              value={
                                                isCreatingLivraison
                                                  ? newDeliveryQuantities[
                                                      item.article_id
                                                    ] ?? ""
                                                  : item.quantiteLivree === ""
                                                  ? ""
                                                  : String(item.quantiteLivree)
                                              }
                                              onChange={(e) => {
                                                const value = e.target.value;
                                                if (isCreatingLivraison) {
                                                  // BL Creation: Store what user is typing
                                                  if (value === "") {
                                                    setNewDeliveryQuantities(
                                                      (prev) => ({
                                                        ...prev,
                                                        [item.article_id]: "",
                                                      })
                                                    );
                                                  } else {
                                                    const newDelivery =
                                                      Math.max(
                                                        0,
                                                        Number(value)
                                                      );
                                                    const currentTotalDelivered =
                                                      Number(
                                                        item.quantiteLivree
                                                      ) || 0;
                                                    const remaining =
                                                      qtyCommandee -
                                                      currentTotalDelivered;

                                                    // Validate: new delivery shouldn't exceed remaining quantity
                                                    if (
                                                      newDelivery > remaining
                                                    ) {
                                                      toast.error(
                                                        `Quantité à livrer (${newDelivery}) ne peut pas dépasser quantité restante (${remaining})`
                                                      );
                                                      setNewDeliveryQuantities(
                                                        (prev) => ({
                                                          ...prev,
                                                          [item.article_id]:
                                                            remaining,
                                                        })
                                                      );
                                                    } else {
                                                      setNewDeliveryQuantities(
                                                        (prev) => ({
                                                          ...prev,
                                                          [item.article_id]:
                                                            newDelivery,
                                                        })
                                                      );
                                                    }
                                                  }
                                                } else {
                                                  // BC Edit: Normal behavior - no error message display
                                                  if (value === "") {
                                                    handleArticleChange(
                                                      item.article_id,
                                                      "quantiteLivree",
                                                      ""
                                                    );
                                                  } else {
                                                    const newQty = Math.max(
                                                      0,
                                                      Math.min(
                                                        Number(value),
                                                        qtyCommandee
                                                      )
                                                    );
                                                    handleArticleChange(
                                                      item.article_id,
                                                      "quantiteLivree",
                                                      newQty
                                                    );
                                                  }
                                                }
                                              }}
                                              className="table-input text-center"
                                              style={{
                                                width: "100%",
                                                fontSize: "0.8rem",
                                                padding: "0.25rem",
                                                // REMOVE the border validation for BC edit, keep only for BL creation
                                                border: (() => {
                                                  if (isCreatingLivraison) {
                                                    const currentQtyLivree =
                                                      Number(
                                                        newDeliveryQuantities[
                                                          item.article_id
                                                        ] ?? 0
                                                      );
                                                    return currentQtyLivree >
                                                      qtyCommandee
                                                      ? "1px solid #f06548"
                                                      : "1px solid #ced4da";
                                                  }
                                                  return "1px solid #ced4da"; // Normal border for BC edit
                                                })(),
                                              }}
                                              placeholder="0"
                                            />
                                            {/* ONLY show error message during BL creation, not BC edit */}
                                            {isCreatingLivraison &&
                                              (() => {
                                                const currentQtyLivree = Number(
                                                  newDeliveryQuantities[
                                                    item.article_id
                                                  ] ?? 0
                                                );

                                                if (
                                                  currentQtyLivree >
                                                  qtyCommandee
                                                ) {
                                                  return (
                                                    <small
                                                      className="text-danger d-block mt-1"
                                                      style={{
                                                        fontSize: "0.7rem",
                                                      }}
                                                    >
                                                      Max: {qtyCommandee}
                                                    </small>
                                                  );
                                                }
                                                return null;
                                              })()}
                                          </td>

                                          <td
                                            style={{ width: "6%" }}
                                            className="text-center"
                                          >
                                            <Badge
                                              color={
                                                qtyRestante > 0
                                                  ? "warning"
                                                  : "success"
                                              }
                                              className="text-xs"
                                            >
                                              {isCreatingLivraison
                                                ? qtyCommandee -
                                                  (Number(
                                                    item.quantiteLivree
                                                  ) || 0) -
                                                  (Number(
                                                    newDeliveryQuantities[
                                                      item.article_id
                                                    ]
                                                  ) || 0)
                                                : qtyRestante}
                                            </Badge>
                                          </td>

                                          <td style={{ width: "10%" }}>
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
                                                fontSize: "0.8rem",
                                                padding: "0.25rem",
                                              }}
                                            />
                                          </td>
                                          <td style={{ width: "10%" }}>
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
                                                fontSize: "0.8rem",
                                                padding: "0.25rem",
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
                                                fontSize: "0.8rem",
                                                padding: "0.25rem",
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
                                            style={{ width: "9%" }}
                                            className="text-end fw-semibold text-xs"
                                          >
                                            {montantHTLigne} DT
                                          </td>
                                          <td
                                            style={{ width: "9%" }}
                                            className="text-end fw-semibold text-primary text-xs"
                                          >
                                            {montantTTCLigne} DT
                                          </td>
                                          <td style={{ width: "4%" }}>
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
                                                padding: "0.15rem 0.3rem",
                                                fontSize: "0.7rem",
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
                  {/* Payment Methods Section */}
<Card className="border-0 shadow-sm mb-4">
  <CardBody className="p-4">
    <div className="d-flex justify-content-between align-items-center">
      <h5 className="fw-semibold text-primary mb-0">
        <i className="ri-bank-card-line me-2"></i>
        Modes de Règlement
      </h5>

      {/* ALWAYS SHOW ADD BUTTON */}
      <Button
        color="outline-primary"
        size="sm"
        onClick={addMethodeReglement}
        className="btn-invoice-outline-primary"
      >
        <i className="ri-add-line me-1"></i>
        Ajouter Paiement 
      </Button>
    </div>

    {/* SHOW PAYMENT METHODS IF THEY EXIST */}
    {methodesReglement.length > 0 && (
      <>
        {/* Liste des méthodes de règlement */}
        {methodesReglement.map((methode, index) => (
          <div
            key={methode.id}
            className="border rounded p-3 mb-3 bg-light"
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0 text-dark">
                {methode.method === "retenue" ? "Retenue à la source" : `Règlement #${index + 1}`}
              </h6>

              <Button
                color="danger"
                size="sm"
                onClick={() =>
                  removeMethodeReglement(methode.id)
                }
                className="btn-invoice-danger"
              >
                <i className="ri-close-line"></i>
              </Button>
            </div>

            <Row className="g-3">
              {/* Type de méthode */}
              <Col md={3}>
                <Label className="form-label fw-semibold">
                  Type*
                </Label>
                <Input
                  type="select"
                  value={methode.method}
                  onChange={(e) => {
                    const newMethod = e.target.value;
                    updateMethodeReglement(
                      methode.id,
                      "method",
                      newMethod
                    );
                    
                    // Set default retention rate to 1% when selecting retention
                    if (newMethod === "retenue") {
                      updateMethodeReglement(
                        methode.id,
                        "tauxRetention",
                        1
                      );
                      // Set amount to 0 for retention
                      updateMethodeReglement(
                        methode.id,
                        "amount",
                        "0,000"
                      );
                    }
                  }}
                  className="form-control"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="traite">Traite</option>
                  <option value="tpe">Carte Bancaire "TPE"</option>
                  <option value="retenue">Retenue à la source</option>
                </Input>
              </Col>

              {/* Montant - Different behavior for retention */}
              <Col md={3}>
                <Label className="form-label fw-semibold">
                  {methode.method === "retenue" ? "Montant calculé (DT)" : "Montant (DT)*"}
                </Label>
                <Input
                  type="text"
                  value={
                    methode.method === "retenue" 
                      ? retentionMontant.toFixed(3).replace(".", ",")
                      : methode.amount
                  }
                  onChange={(e) => {
                    // Only allow changes for non-retention methods
                    if (methode.method !== "retenue") {
                      updateMethodeReglement(
                        methode.id,
                        "amount",
                        e.target.value
                      );
                    }
                  }}
                  readOnly={methode.method === "retenue"}
                  className={`form-control text-end ${
                    methode.method === "retenue" ? 'bg-light' : ''
                  }`}
                  placeholder="000,000"
                  required={methode.method !== "retenue"}
                />
                {methode.method === "retenue" && (
                  <small className="text-muted">
                    Calculé automatiquement à partir du taux
                  </small>
                )}
              </Col>

              {/* Retention Rate Field */}
              {methode.method === "retenue" && (
                <Col md={3}>
                  <Label className="form-label fw-semibold">
                    Taux de retenue (%)*
                  </Label>
                  <Input
                    type="select"
                    value={methode.tauxRetention || 1}
                    onChange={(e) =>
                      updateMethodeReglement(
                        methode.id,
                        "tauxRetention",
                        Number(e.target.value)
                      )
                    }
                    className="form-control"
                    required
                  >
                    <option value="1">1%</option>
                    <option value="2">2%</option>
                    <option value="3">3%</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                  </Input>
                </Col>
              )}

              {/* Champs conditionnels pour les autres méthodes */}
              {(methode.method === "cheque" || methode.method === "traite") && (
                <Col md={3}>
                  <Label className="form-label fw-semibold">
                    {methode.method === "cheque" ? "Numéro Chèque*" : "Numéro Traite*"}
                  </Label>
                  <Input
                    type="text"
                    value={methode.numero || ""}
                    onChange={(e) =>
                      updateMethodeReglement(
                        methode.id,
                        "numero",
                        e.target.value
                      )
                    }
                    placeholder={
                      methode.method === "cheque" ? "N° chèque" : "N° traite"
                    }
                    className="form-control"
                    required
                  />
                </Col>
              )}

              {methode.method === "cheque" && (
                <Col md={3}>
                  <Label className="form-label fw-semibold">
                    Banque*
                  </Label>
                  <Input
                    type="text"
                    value={methode.banque || ""}
                    onChange={(e) =>
                      updateMethodeReglement(
                        methode.id,
                        "banque",
                        e.target.value
                      )
                    }
                    placeholder="Nom banque"
                    className="form-control"
                    required
                  />
                </Col>
              )}

              {methode.method === "traite" && (
                <Col md={3}>
                  <Label className="form-label fw-semibold">
                    Date Échéance*
                  </Label>
                  <Input
                    type="date"
                    value={
                      methode.dateEcheance ||
                      moment().format("YYYY-MM-DD")
                    }
                    onChange={(e) =>
                      updateMethodeReglement(
                        methode.id,
                        "dateEcheance",
                        e.target.value
                      )
                    }
                    className="form-control"
                    required
                  />
                </Col>
              )}
            </Row>
          </div>
        ))}

        {/* Bouton pour ajouter une méthode supplémentaire */}
        <div className="text-center mb-3">
          <Button
            color="outline-primary"
            size="sm"
            onClick={addMethodeReglement}
            className="btn-invoice-outline-primary"
          >
            <i className="ri-add-line me-1"></i>
            Ajouter une autre méthode
          </Button>
        </div>

        {/* Résumé des paiements */}
        <div className="mt-3">
          <Label className="form-label fw-semibold">
            Notes Paiement
          </Label>
          <Input
            type="textarea"
            value={espaceNotes}
            onChange={(e) =>
              setEspaceNotes(e.target.value)
            }
            placeholder="Notes supplémentaires sur le paiement..."
            rows="2"
            className="form-control"
          />
        </div>
      </>
    )}
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

      <Modal
  isOpen={paiementModal}
  toggle={() => setPaiementModal(false)}
  centered
  className="invoice-modal"
>
  <ModalHeader toggle={() => setPaiementModal(false)}>
    Ajouter Paiement - Commande #{selectedBonForPaiement?.numeroCommande}
  </ModalHeader>
  <Form
    onSubmit={paiementValidation.handleSubmit}
    className="invoice-form"
  >
    <ModalBody style={{ padding: "20px" }}>
      {/* Retention and Rest à Payer Display */}
      {selectedBonForPaiement?.montantRetenue && getSafeNumber(selectedBonForPaiement.montantRetenue) > 0 && (
        <div className="mb-3 p-2 bg-light rounded">
          <small className="text-muted d-block">
            <strong>Retenue à la source:</strong> -{getSafeNumber(selectedBonForPaiement.montantRetenue).toFixed(3)} DT
          </small>
        </div>
      )}
      
      <div className="mb-3 p-2 bg-success bg-opacity-10 rounded">
        <small className="text-muted d-block">Reste à payer:</small>
        <strong className="text-success fs-5">
          {(() => {
            if (!selectedBonForPaiement) return "0,000";
            
            const totalNet = getSafeNumber(selectedBonForPaiement.totalTTC);
            const retentionAmount = getSafeNumber(selectedBonForPaiement.montantRetenue);
            const montantPaye = getSafeNumber(selectedBonForPaiement.montantPaye);
            
            const amountAfterRetention = totalNet - retentionAmount;
            const availableAmount = Math.max(0, amountAfterRetention - montantPaye);
            
            return availableAmount.toFixed(3).replace(".", ",");
          })()} DT
        </strong>
      </div>

      <Row>
        <Col md={6}>
          <div className="mb-3">
            <Label>Montant payé*</Label>
            <Input
              type="text"
              name="montant"
              value={paiementValidation.values.montant}
              onChange={handleMontantChangePaiement}
              invalid={
                paiementValidation.touched.montant &&
                !!paiementValidation.errors.montant
              }
              placeholder="0,000"
            />
            <FormFeedback>
              {paiementValidation.errors.montant}
            </FormFeedback>
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-3">
            <Label>Mode de paiement*</Label>
            <Input
              type="select"
              name="modePaiement"
              value={paiementValidation.values.modePaiement}
              onChange={paiementValidation.handleChange}
              invalid={
                paiementValidation.touched.modePaiement &&
                !!paiementValidation.errors.modePaiement
              }
            >
              <option value="Espece">En espèces</option>
              <option value="Cheque">Chèque</option>
              <option value="Virement">Virement</option>
              <option value="Traite">Traite</option>
              <option value="Autre">Autre</option>
            </Input>
            <FormFeedback>
              {paiementValidation.errors.modePaiement}
            </FormFeedback>
          </div>
        </Col>
      </Row>
      
      {/* Cheque Fields */}
      {paiementValidation.values.modePaiement === "Cheque" && (
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <Label>Numéro du chèque*</Label>
              <Input
                type="text"
                name="numeroCheque"
                value={paiementValidation.values.numeroCheque || ""}
                onChange={paiementValidation.handleChange}
                placeholder="Saisir le numéro du chèque"
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <Label>Banque*</Label>
              <Input
                type="text"
                name="banque"
                value={paiementValidation.values.banque || ""}
                onChange={paiementValidation.handleChange}
                placeholder="Nom de la banque"
              />
            </div>
          </Col>
        </Row>
      )}
      
      {/* Traite Fields */}
      {paiementValidation.values.modePaiement === "Traite" && (
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <Label>Numéro de traite*</Label>
              <Input
                type="text"
                name="numeroTraite"
                value={paiementValidation.values.numeroTraite || ""}
                onChange={paiementValidation.handleChange}
                placeholder="Saisir le numéro de traite"
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <Label>Date d'échéance*</Label>
              <Input
                type="date"
                name="dateEcheance"
                value={paiementValidation.values.dateEcheance || ""}
                onChange={paiementValidation.handleChange}
                min={moment().format("YYYY-MM-DD")}
              />
            </div>
          </Col>
        </Row>
      )}
     
      <Row>
        <Col md={6}>
          <div className="mb-3">
            <Label>Paiement n °*</Label>
            <Input
              type="text"
              name="numeroPaiement"
              value={paiementValidation.values.numeroPaiement}
              onChange={paiementValidation.handleChange}
              invalid={
                paiementValidation.touched.numeroPaiement &&
                !!paiementValidation.errors.numeroPaiement
              }
            />
            <FormFeedback>
              {paiementValidation.errors.numeroPaiement}
            </FormFeedback>
          </div>
        </Col>
        <Col md={6}>
          <div className="mb-3">
            <Label>Date*</Label>
            <Input
              type="date"
              name="date"
              value={paiementValidation.values.date}
              onChange={paiementValidation.handleChange}
              invalid={
                paiementValidation.touched.date &&
                !!paiementValidation.errors.date
              }
            />
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
              value={paiementValidation.values.notes}
              onChange={paiementValidation.handleChange}
              rows="2"
              placeholder="Notes supplémentaires..."
            />
          </div>
        </Col>
      </Row>
    </ModalBody>
    <ModalFooter>
      <Button color="light" onClick={() => setPaiementModal(false)}>
        <i className="ri-close-line align-bottom me-1"></i> Annuler
      </Button>
      <Button color="primary" type="submit">
        <i className="ri-save-line align-bottom me-1"></i> Enregistrer Paiement
      </Button>
    </ModalFooter>
  </Form>
</Modal>

      {/* PDF Modal */}
      {selectedBonCommandeForPdf && (
        <BonCommandePDFModal
          isOpen={pdfModal}
          toggle={() => setPdfModal(false)}
          bonCommande={selectedBonCommandeForPdf}
          companyInfo={companyInfo}
        />
      )}
    </div>
  );
};

export default BonCommandeClientList;
