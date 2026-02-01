import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import moment from "moment";
import { BonCommandeClient } from "../../../Components/Article/Interfaces";

Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottom: "1pt solid #000",
    paddingBottom: 6,
  },
  commandeDetails: {
    marginBottom: 6,
  },
  commandeDetailItem: {
    marginBottom: 2,
  },
  commandeDetailLabel: {
    fontSize: 13,
  },
  N: {
    fontSize: 15,
  },
  commandeNumberValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  companyInfo: {
    width: "60%",
  },
  logo: {
    width: 200,
    marginBottom: 5,
  },
  clientVendeurSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 3,
  },
  vendeurInfo: {
    width: "35%",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 3,
    fontWeight: "normal",
  },
  clientText: {
    fontSize: 10,
    marginBottom: 1,
    fontWeight: "bold",
  },
  vendeurText: {
    fontSize: 10,
    marginBottom: 1,
    fontWeight: "bold",
  },
  tableContainer: {
    marginBottom: 15,
    marginTop: 16, // Increased from 6 to 16 (approx 1cm down)
    borderTop: "1pt solid #ddd",
    borderLeft: "1pt solid #ddd",
    borderRight: "1pt solid #ddd",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#00aeef",
    paddingVertical: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #ddd",
    paddingVertical: 6,
    minHeight: 24,
  },
  tableColHeader: {
    paddingHorizontal: 4,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 10,
    color: "#ffffff",
  },
  tableCol: {
    paddingHorizontal: 4,
    fontSize: 10,
    textAlign: "center",
  },
  colN: { width: "5%" },
  colArticle: { width: "15%", textAlign: "left" },
  colDesignation: { width: "30%", textAlign: "left" },
  colQteC: { width: "8%" },
  colQteLiv: { width: "8%" },
  colPUHT: { width: "10%", textAlign: "right" },
  colTVA: { width: "8%" },
  colPUTTC: { width: "10%", textAlign: "right" },
  colMontantTTC: { width: "10%", textAlign: "right" },
  summaryArea: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 160,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftColumn: { 
    width: "50%",
    flexDirection: "column",
  },
  tvaTable: {
    borderTop: "1pt solid #ddd",
    borderLeft: "1pt solid #ddd",
    borderRight: "1pt solid #ddd",
    width: "100%",
  },
  tvaHeader: {
    flexDirection: "row",
    backgroundColor: "#00aeef",
    paddingVertical: 5,
  },
  tvaRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #ddd",
    paddingVertical: 5,
  },
  tvaHeaderTaux: { width: "22%", fontSize: 10, fontWeight: "bold", textAlign: "center", color: "#fff", paddingHorizontal: 4 },
  tvaHeaderBase: { width: "35%", fontSize: 10, fontWeight: "bold", textAlign: "right", color: "#fff", paddingHorizontal: 4 },
  tvaHeaderMontant: { width: "40%", fontSize: 10, fontWeight: "bold", textAlign: "right", color: "#fff", paddingHorizontal: 4 },
  tvaColTaux: { width: "22%", fontSize: 10, textAlign: "center", paddingHorizontal: 4 },
  tvaColBase: { width: "35%", fontSize: 10, textAlign: "right", paddingHorizontal: 4 },
  tvaColMontant: { width: "40%", fontSize: 10, textAlign: "right", paddingHorizontal: 4 },
  paymentBoxUnderTVA: {
    width: "100%",
    border: "1pt solid #ddd",
    borderTop: "none",
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  paymentHeader: {
    flexDirection: "row",
    backgroundColor: "#00aeef",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  paymentTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    width: "100%",
  },
  paymentContent: {
    padding: 3,
  },
  paymentLine: {
    fontSize: 8,
    marginBottom: 2,
  },
  totalsContainer: { width: "40%" },
  totalsBox: { 
    padding: 8, 
    border: "1pt solid #ddd",
    width: "100%",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  summaryLabel: { fontSize: 11 },
  summaryValue: { fontSize: 11 },
  netAPayerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    borderTop: "2pt solid #333",
    marginHorizontal: -8,
    marginBottom: -8,
  },
  netAPayerLabel: { 
    fontSize: 12, 
    fontWeight: "bold", 
    backgroundColor: "#00aeef",
    color: "#ffffff", 
    width: "50%",
    paddingVertical: 8,
    paddingLeft: 8,
  },
  netAPayerValue: { 
    fontSize: 12, 
    fontWeight: "bold", 
    textAlign: "right", 
    width: "50%",
    paddingVertical: 6,
    paddingRight: 8,
  },
  cachetSignatureSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 75,
    left: 20,
    right: 20,
  },
  signatureContainer: { width: "35%", alignItems: "center" },
  cachetContainer: { width: "35%", alignItems: "center" },
  signatureText: { fontSize: 11, marginBottom: 2, fontWeight: "bold" },
  cachetText: { fontSize: 11, marginBottom: 2, fontWeight: "bold" },
  subText: { fontSize: 9, fontStyle: "italic" },
  footer: {
    position: "absolute",
    bottom: 5,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 8,
    borderTop: "1pt solid #ddd",
    paddingTop: 3,
  },
  footerLine: {
    marginBottom: 1,
  },
  amountInWords: {
    position: "absolute",
    bottom: 115,
    left: 20,
    right: 20,
    padding: 8,
    border: "1pt solid #ddd",
  },
  amountText: { fontSize: 10, textAlign: "center" },
  pageNumber: { position: "absolute", bottom: 5, left: 20, fontSize: 8 },
  boldText: { fontWeight: "bold" },
  clientInfoContainer: {
    width: "60%",
    alignItems: "flex-start",
    left: "210",
  },
  clientLine: { fontSize: 10, marginBottom: 1, fontWeight: "bold", flexWrap: "wrap" },
  clientLineItem: { fontSize: 10, marginBottom: 1, fontWeight: "bold" },
  continuationHeader: { 
    fontSize: 10, 
    textAlign: "center", 
    marginBottom: 8, 
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 5,
    border: "1pt solid #ddd"
  },
  vendeurPaymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  vendeurContainer: {
    width: '55%',
  },
  paymentContainerAboveTable: {
    width: '40%',
  }
});

interface BonCommandePDFProps {
  bonCommande: BonCommandeClient;
  companyInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
    logo?: string;
    taxId: string;
    gsm: string;
  };
}

const BonCommandePDF: React.FC<BonCommandePDFProps> = ({
  bonCommande,
  companyInfo,
}) => {


// REPLACE your entire calculateTotals function with this EXACT copy from FactureVentePDF:

const calculateTotals = () => {
  if (!bonCommande?.articles || bonCommande.articles.length === 0) {
    return {
      sousTotalHT: 0,
      netHT: 0,
      totalTax: 0,
      grandTotal: 0,
      finalTotal: 0,
      discountAmount: 0,
      retentionAmount: 0,
      netAPayer: 0,
      acompteTotal: 0,
      resteAPayer: 0,
      totalPaye: 0,
      tvaBreakdown: {} as { [key: number]: { base: number; montant: number } },
      hasRetention: false,
    };
  }

  // Step 1: Calculate original totals (without document-level discount)
  let sousTotalHTValue = 0;
  let totalTaxValue = 0;
  let grandTotalValue = 0;
  
  // Store line details for proportional calculation
  const lineDetails: Array<{
    ht: number;
    tvaRate: number;
    tvaAmount: number;
    ttc: number;
    qty: number;
  }> = [];
  
  // Store TVA breakdown for original amounts
  const tvaBreakdownOriginal: { [key: number]: { base: number; montant: number } } = {};

  // Calculate original line amounts (with line-level discounts only)
  bonCommande.articles.forEach((article) => {
    const qty = Number(article.quantite) || 0;
    const articleRemise = Number(article.remise) || 0;
    const tvaRate = Number(article.tva) || 0;
    
    let unitHT = Number(article.prixUnitaire) || 0;
    let unitTTC = Number(article.prix_ttc) || unitHT * (1 + tvaRate / 100);

    // Calculate line amounts
    const lineHT = Math.round(unitHT * 1000) / 1000;
    const lineTTC = Math.round(unitTTC * 1000) / 1000;

    const montantSousTotalHT = Math.round(qty * lineHT * 1000) / 1000;
    const montantNetHTLigne = Math.round(
      qty * lineHT * (1 - articleRemise / 100) * 1000
    ) / 1000;
    const montantTTCLigne = Math.round(qty * lineTTC * 1000) / 1000;
    const montantTVALigne = Math.round(
      (montantTTCLigne - montantNetHTLigne) * 1000
    ) / 1000;

    sousTotalHTValue += montantSousTotalHT;
    totalTaxValue += montantTVALigne;
    grandTotalValue += montantTTCLigne;

    // Store line details
    lineDetails.push({
      ht: montantNetHTLigne,
      tvaRate: tvaRate,
      tvaAmount: montantTVALigne,
      ttc: montantTTCLigne,
      qty: qty
    });

    // Store original TVA breakdown
    if (tvaRate > 0) {
      if (!tvaBreakdownOriginal[tvaRate]) {
        tvaBreakdownOriginal[tvaRate] = { base: 0, montant: 0 };
      }
      tvaBreakdownOriginal[tvaRate].base += montantNetHTLigne;
      tvaBreakdownOriginal[tvaRate].montant += montantTVALigne;
    }
  });

  // Round original totals
  sousTotalHTValue = Math.round(sousTotalHTValue * 1000) / 1000;
  totalTaxValue = Math.round(totalTaxValue * 1000) / 1000;
  grandTotalValue = Math.round(grandTotalValue * 1000) / 1000;

  let finalTotalValue = grandTotalValue;
  let discountAmountValue = 0;
  let netHTValue = sousTotalHTValue;
  
  // Initialize final TVA breakdown
  let tvaBreakdownFinal: { [key: number]: { base: number; montant: number } } = {};

  // Apply document-level remise if exists
  const remiseValue = Number(bonCommande.remise) || 0;
  const remiseTypeValue = bonCommande.remiseType || "percentage";

  if (remiseValue > 0) {
    if (remiseTypeValue === "percentage") {
      // ✅ SIMPLE FORMULA: Apply percentage discount on HT
      discountAmountValue = Math.round((sousTotalHTValue * remiseValue / 100) * 1000) / 1000;
      netHTValue = sousTotalHTValue - discountAmountValue;
      
      // Calculate new TVA proportionally
      const tvaToHtRatio = sousTotalHTValue > 0 ? totalTaxValue / sousTotalHTValue : 0;
      const newTVA = Math.round((netHTValue * tvaToHtRatio) * 1000) / 1000;
      
      totalTaxValue = newTVA;
      finalTotalValue = Math.round((netHTValue + newTVA) * 1000) / 1000;
      
      // Calculate TVA breakdown proportionally
      const discountRatio = netHTValue / sousTotalHTValue;
      
      Object.keys(tvaBreakdownOriginal).forEach(rate => {
        const tvaRate = parseFloat(rate);
        tvaBreakdownFinal[tvaRate] = {
          base: Math.round((tvaBreakdownOriginal[tvaRate].base * discountRatio) * 1000) / 1000,
          montant: Math.round((tvaBreakdownOriginal[tvaRate].montant * discountRatio) * 1000) / 1000
        };
      });
      
    } else if (remiseTypeValue === "fixed") {
      // ✅ FIXED DISCOUNT FORMULA: TTC is given, calculate HT
      finalTotalValue = Math.round(Number(remiseValue) * 1000) / 1000;
      
      // Find all unique TVA rates
      const tvaRates = Array.from(new Set(bonCommande.articles.map(a => Number(a.tva) || 0)));
      
      if (tvaRates.length === 1 && tvaRates[0] > 0) {
        // ✅ SINGLE TVA RATE: HT = TTC / (1 + TVA rate)
        const tvaRate = tvaRates[0];
        netHTValue = Math.round((finalTotalValue / (1 + tvaRate / 100)) * 1000) / 1000;
        totalTaxValue = Math.round((finalTotalValue - netHTValue) * 1000) / 1000;
        
        // For single rate, TVA breakdown is simple
        tvaBreakdownFinal[tvaRate] = {
          base: netHTValue,
          montant: totalTaxValue
        };
        
      } else {
        // ✅ MULTIPLE TVA RATES: Use proportional method
        const discountCoefficient = grandTotalValue > 0 ? finalTotalValue / grandTotalValue : 0;
        
        // Reset values
        netHTValue = 0;
        totalTaxValue = 0;
        
        // Recalculate each line proportionally
        bonCommande.articles.forEach((article) => {
          const qty = Number(article.quantite) || 0;
          const articleRemise = Number(article.remise) || 0;
          const tvaRate = Number(article.tva) || 0;
          let unitHT = Number(article.prixUnitaire) || 0;
          
          // Calculate original line amounts
          const montantNetHTLigne = Math.round(
            qty * unitHT * (1 - articleRemise / 100) * 1000
          ) / 1000;
          
          // Apply coefficient to get new amounts
          const newLineHT = Math.round((montantNetHTLigne * discountCoefficient) * 1000) / 1000;
          const newLineTVA = Math.round((newLineHT * (tvaRate / 100)) * 1000) / 1000;
          
          netHTValue += newLineHT;
          totalTaxValue += newLineTVA;
          
          // Update TVA breakdown
          if (tvaRate > 0) {
            if (!tvaBreakdownFinal[tvaRate]) {
              tvaBreakdownFinal[tvaRate] = { base: 0, montant: 0 };
            }
            tvaBreakdownFinal[tvaRate].base += newLineHT;
            tvaBreakdownFinal[tvaRate].montant += newLineTVA;
          }
        });
        
        // Round final values
        netHTValue = Math.round(netHTValue * 1000) / 1000;
        totalTaxValue = Math.round(totalTaxValue * 1000) / 1000;
      }
      
      discountAmountValue = Math.round((sousTotalHTValue - netHTValue) * 1000) / 1000;
    }
    
    // Final rounding
    netHTValue = Math.round(netHTValue * 1000) / 1000;
    totalTaxValue = Math.round(totalTaxValue * 1000) / 1000;
    finalTotalValue = Math.round(finalTotalValue * 1000) / 1000;
    discountAmountValue = Math.round(discountAmountValue * 1000) / 1000;
    
  } else {
    // No document-level discount - use original values
    netHTValue = sousTotalHTValue;
    tvaBreakdownFinal = { ...tvaBreakdownOriginal };
  }

  // ✅ BONCOMMANDE-SPECIFIC: Add retention calculation
  const retentionAmountValue = Number(bonCommande.montantRetenue) || 0;
  
  // ✅ NET À PAYER is finalTotal (same as FactureVentePDF)
  const netAPayerValue = finalTotalValue;

  // ✅ BONCOMMANDE-SPECIFIC: Calculate acompte total
  const acompteTotal = bonCommande.paymentMethods 
    ? bonCommande.paymentMethods.reduce((sum: number, pm: any) => 
        pm.method !== "retenue" ? sum + (Number(pm.amount) || 0) : sum, 0)
    : 0;

  // ✅ BONCOMMANDE-SPECIFIC: Calculate reste à payer
  const totalPayments = bonCommande.paiements?.reduce((sum, p) => sum + Number(p.montant), 0) || 0;
  const totalPaye = acompteTotal + totalPayments;
  const resteAPayerValue = Math.max(0, netAPayerValue - totalPaye);

  return {
    sousTotalHT: Math.round(sousTotalHTValue * 1000) / 1000,
    netHT: Math.round(netHTValue * 1000) / 1000,
    totalTax: Math.round(totalTaxValue * 1000) / 1000,
    grandTotal: Math.round(grandTotalValue * 1000) / 1000,
    finalTotal: Math.round(finalTotalValue * 1000) / 1000,
    discountAmount: Math.round(discountAmountValue * 1000) / 1000,
    retentionAmount: Math.round(retentionAmountValue * 1000) / 1000,
    netAPayer: Math.round(netAPayerValue * 1000) / 1000,
    acompteTotal: Math.round(acompteTotal * 1000) / 1000,
    resteAPayer: Math.round(resteAPayerValue * 1000) / 1000,
    totalPaye: Math.round(totalPaye * 1000) / 1000,
    tvaBreakdown: tvaBreakdownFinal,
    hasRetention: bonCommande.hasRetenue || false,
  };
};

  const {
    sousTotalHT,
    netHT,
    totalTax,
    grandTotal,
    finalTotal,
    discountAmount,
    retentionAmount,
    netAPayer,
    acompteTotal,
    resteAPayer,
    totalPaye,
    tvaBreakdown,
    hasRetention,
  } = calculateTotals();

// Keep the formatCurrency function with .toFixed(3):
const formatCurrency = (amount: number) => {
  return amount.toFixed(3);
};

  const numberToWords = (num: number): string => {
    const units = [
      "",
      "un",
      "deux",
      "trois",
      "quatre",
      "cinq",
      "six",
      "sept",
      "huit",
      "neuf",
    ];
    const teens = [
      "dix",
      "onze",
      "douze",
      "treize",
      "quatorze",
      "quinze",
      "seize",
      "dix-sept",
      "dix-huit",
      "dix-neuf",
    ];
    const tens = [
      "",
      "dix",
      "vingt",
      "trente",
      "quarante",
      "cinquante",
      "soixante",
      "soixante-dix",
      "quatre-vingt",
      "quatre-vingt-dix",
    ];
    
    const integerPart = Math.floor(num);
    if (integerPart === 0) return "Zéro dinars zéro millimes uniquement";
    
    let words = "";
    
    // Handle thousands
    if (integerPart >= 1000) {
      const thousands = Math.floor(integerPart / 1000);
      if (thousands === 1) {
        words += "mille";
      } else {
        words += numberToWords(thousands).replace(" dinars zéro millimes uniquement", "") + " mille";
      }
      if (integerPart % 1000 > 0) words += " ";
    }
    
    const remainder = integerPart % 1000;
    
    // Handle hundreds
    if (remainder >= 100) {
      const hundreds = Math.floor(remainder / 100);
      if (hundreds === 1) {
        words += "cent";
      } else {
        words += units[hundreds] + " cent";
      }
      if (remainder % 100 > 0) words += " ";
    }
    
    // Handle tens and units
    const smallRemainder = remainder % 100;
    if (smallRemainder > 0) {
      if (smallRemainder < 10) {
        words += units[smallRemainder];
      } else if (smallRemainder < 20) {
        words += teens[smallRemainder - 10];
      } else {
        const tensDigit = Math.floor(smallRemainder / 10);
        const unitsDigit = smallRemainder % 10;
        
        if (tensDigit === 7 || tensDigit === 9) {
          // Special cases for 70-79 and 90-99
          words += tens[tensDigit - 1];
          if (unitsDigit === 1) {
            words += "-et-onze";
          } else if (unitsDigit > 1) {
            words += "-" + teens[unitsDigit];
          } else {
            words += "-dix";
          }
        } else {
          words += tens[tensDigit];
          if (unitsDigit > 0) {
            if (unitsDigit === 1 && tensDigit !== 8 && tensDigit !== 9) {
              words += "-et-un";
            } else {
              words += "-" + units[unitsDigit];
            }
          }
        }
      }
    }
    
    words += " dinars zéro millimes";
    return words.charAt(0).toUpperCase() + words.slice(1) + " uniquement";
  };

  const amountInWords = numberToWords(netAPayer);
  const hasPayments = bonCommande.paiements && bonCommande.paiements.length > 0;
  
  // PAGINATION LOGIC
// PAGINATION LOGIC

// PAGINATION LOGIC
const totalArticles = bonCommande?.articles?.length || 0;

// Determine pagination based on total articles
let articlesFirstPage: any[] = [];
let articlesSecondPage: any[] = [];
let needsSecondPage = false;
let totalPages = 1;

if (totalArticles <= 10) {
  // 1-10 articles: Single page with ALL content
  articlesFirstPage = bonCommande?.articles?.slice(0, 10) || [];
  needsSecondPage = false;
  totalPages = 1;
} else if (totalArticles <= 15) {
  // 11-15 articles: Single page with ALL articles but add empty second page for summary
  articlesFirstPage = bonCommande?.articles?.slice(0, 15) || [];
  needsSecondPage = true; // Force second page for summary content
  totalPages = 2;
} else {
  // 16+ articles: First page shows 15 articles, second page shows rest + ALL content
  articlesFirstPage = bonCommande?.articles?.slice(0, 15) || [];
  articlesSecondPage = bonCommande?.articles?.slice(15) || [];
  needsSecondPage = articlesSecondPage.length > 0;
  totalPages = needsSecondPage ? 2 : 1;
}

  // Function to wrap client info text if it exceeds 22 characters
  const wrapClientText = (text: string, maxLength: number = 22): string[] => {
    if (!text || text.length <= maxLength) return [text];
    
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    
    words.forEach((word) => {
      if ((currentLine + " " + word).length > maxLength) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + " " + word : word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
  };


 


  const renderTVABreakdown = () => {
    const tvaRates = Object.keys(tvaBreakdown).map(rate => parseFloat(rate)).sort((a, b) => a - b);
  
    if (tvaRates.length === 0) {
      return (
        <View style={styles.tvaTable}>
          <View style={styles.tvaHeader}>
            <Text style={styles.tvaHeaderTaux}>Taux TVA</Text>
            <Text style={styles.tvaHeaderBase}>Base HT</Text>
            <Text style={styles.tvaHeaderMontant}>Montant TVA</Text>
          </View>
          <View style={styles.tvaRow}>
            <Text style={styles.tvaColTaux}>-</Text>
            <Text style={styles.tvaColBase}>0.000 DT</Text>
            <Text style={styles.tvaColMontant}>0.000 DT</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.tvaTable}>
        <View style={styles.tvaHeader}>
          <Text style={styles.tvaHeaderTaux}>Taux TVA</Text>
          <Text style={styles.tvaHeaderBase}>Base HT</Text>
          <Text style={styles.tvaHeaderMontant}>Montant TVA</Text>
        </View>
         
        {tvaRates.map(rate => (
          <View style={styles.tvaRow} key={rate}>
            <Text style={styles.tvaColTaux}>{rate}%</Text>
            <Text style={styles.tvaColBase}>
              {formatCurrency(tvaBreakdown[rate].base)} DT
            </Text>
            <Text style={styles.tvaColMontant}>
              {formatCurrency(tvaBreakdown[rate].montant)} DT
            </Text>
          </View>
        ))}
      </View>
    );
  };
  

  const renderPaymentBoxUnderTVA = () => {
    const paiements = bonCommande.paiements || [];
    const paymentMethods = bonCommande.paymentMethods || [];
    
    const hasPayments = paiements.length > 0 || paymentMethods.length > 0;
    
    const paymentLines: JSX.Element[] = [];
    const descs: JSX.Element[][] = [];
    const summableModes = ["Espèces", "Virement", "Espece", "especes", "virement"];
    
    // Process payment methods (acompte) - EXCLUDE RETENUE
    paymentMethods.forEach((pm: any) => {
      const method = pm.method;
      const amount = Number(pm.amount) || 0;
      
      // Skip retenue method - we'll handle it separately at the end
      if (method === "retenue") {
        return;
      }
      
      if (summableModes.includes(method)) {
        // These will be handled in the grouping below
      } else {
        // For non-summable methods like cheque, traite
        const elements: JSX.Element[] = [];
        
        if (method === "cheque") {
          elements.push(<Text key="cheque">chèque </Text>);
          elements.push(
            <Text key="banque" style={styles.boldText}>
              {pm.banque || ''}
            </Text>
          );
          elements.push(<Text key="n"> N° </Text>);
          elements.push(
            <Text key="numero" style={styles.boldText}>
              {pm.numero || ''}
            </Text>
          );
        } else if (method === "traite") {
          elements.push(<Text key="traite">traite N° </Text>);
          elements.push(
            <Text key="numero" style={styles.boldText}>
              {pm.numero || ''}
            </Text>
          );
          elements.push(<Text key="echeance1"> échéance </Text>);
          elements.push(
            <Text key="echeance2" style={styles.boldText}>
              {pm.dateEcheance
                ? moment(pm.dateEcheance).format("DD/MM/YYYY")
                : "Non spécifiée"}
            </Text>
          );
        } else {
          // For other methods
          const methodLabel = getMethodLabel(method);
          elements.push(
            <Text key="mode" style={styles.boldText}>
              {methodLabel}
            </Text>
          );
        }
        
        elements.push(<Text key="montant1"> d'un montant de </Text>);
        elements.push(
          <Text key="montant2" style={styles.boldText}>
            {formatCurrency(amount)} DT
          </Text>
        );
        
        descs.push(elements);
      }
    });
  
    // Process additional paiements
    paiements.forEach((p) => {
      if (summableModes.includes(p.modePaiement)) {
        // These will be handled in grouping
      } else {
        descs.push(getPaymentDesc(p));
      }
    });
  
    // Group summable payments
    const summable: { [key: string]: number } = {};
    
    // Sum payment methods (EXCLUDE RETENUE)
    paymentMethods.forEach((pm: any) => {
      const method = pm.method;
      if (method !== "retenue" && summableModes.includes(method)) {
        const methodLabel = getMethodLabel(method);
        if (!summable[methodLabel]) summable[methodLabel] = 0;
        summable[methodLabel] += Number(pm.amount) || 0;
      }
    });
    
    // Sum additional paiements
    paiements.forEach((p) => {
      if (summableModes.includes(p.modePaiement)) {
        const methodLabel = getPaymentModeLabel(p.modePaiement);
        if (!summable[methodLabel]) summable[methodLabel] = 0;
        summable[methodLabel] += Number(p.montant);
      }
    });
  
    // Add summable payments to descs
    Object.keys(summable).forEach((mode) => {
      const elements: JSX.Element[] = [];
      elements.push(
        <Text key="mode" style={styles.boldText}>
          {mode}
        </Text>
      );
      elements.push(<Text key="montant1"> d'un montant de </Text>);
      elements.push(
        <Text key="montant2" style={styles.boldText}>
          {formatCurrency(summable[mode])} DT
        </Text>
      );
      descs.push(elements);
    });
  
    // ADD RETENTION AS THE LAST ITEM IF has_retenue IS TRUE
    if (hasRetention && retentionAmount > 0) {
      const retentionElements: JSX.Element[] = [
        <Text key="retenue">Retenue à la source d'un montant de </Text>,
        <Text key="retenueAmount" style={styles.boldText}>
          {formatCurrency(retentionAmount)} DT
        </Text>
      ];
      descs.push(retentionElements);
    }
  
    // Build payment lines
    if (descs.length > 0) {
      const firstLineElements: JSX.Element[] = [
        <Text key="intro">Commande payée par </Text>,
      ];
     
      const firstLine = [...firstLineElements, ...descs[0]];
      paymentLines.push(
        <Text key="first" style={styles.paymentLine}>
          {firstLine}
        </Text>
      );
      for (let i = 1; i < descs.length; i++) {
        paymentLines.push(
          <Text key={`pay${i}`} style={styles.paymentLine}>
            {descs[i]}
          </Text>
        );
      }
    }
  
    // Always show reste à payer
    paymentLines.push(
      <Text key="reste" style={[styles.paymentLine, styles.boldText]}>
        Reste à payer: {formatCurrency(resteAPayer)} DT
      </Text>
    );
  
    return (
      <View style={styles.paymentBoxUnderTVA}>
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentTitle}>INFORMATIONS DE PAIEMENTS</Text>
        </View>
        <View style={styles.paymentContent}>
          {paymentLines}
        </View>
      </View>
    );
  };
  
  // Helper functions
  const getMethodLabel = (method: string): string => {
    const labels: { [key: string]: string } = {
      "especes": "Espèces",
      "cheque": "Chèque",
      "virement": "Virement",
      "traite": "Traite",
      "carte": "Carte",
      "tpe": "TPE",
      "retenue": "Retenue à la source"
    };
    return labels[method] || method;
  };
  
  const getPaymentModeLabel = (mode: string): string => {
    const labels: { [key: string]: string } = {
      "Espece": "Espèces",
      "Cheque": "Chèque",
      "Virement": "Virement",
      "Traite": "Traite",
      "Retention": "Retention à la source",
      "Autre": "Autre"
    };
    return labels[mode] || mode;
  };
  
  const getPaymentDesc = (p: any): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    if (p.modePaiement === "Cheque") {
      elements.push(<Text key="cheque">chèque </Text>);
      elements.push(
        <Text key="banque" style={styles.boldText}>
          {p.banque}
        </Text>
      );
      elements.push(<Text key="n"> N° </Text>);
      elements.push(
        <Text key="numero" style={styles.boldText}>
          {p.numeroCheque}
        </Text>
      );
      elements.push(<Text key="montant1"> d'un montant de </Text>);
      elements.push(
        <Text key="montant2" style={styles.boldText}>
          {formatCurrency(Number(p.montant))} DT
        </Text>
      );
    } else if (p.modePaiement === "Traite") {
      elements.push(<Text key="traite">traite N° </Text>);
      elements.push(
        <Text key="numero" style={styles.boldText}>
          {p.numeroTraite}
        </Text>
      );
      elements.push(<Text key="echeance1"> échéance </Text>);
      elements.push(
        <Text key="echeance2" style={styles.boldText}>
          {p.dateEcheance
            ? moment(p.dateEcheance).format("DD/MM/YYYY")
            : "Non spécifiée"}
        </Text>
      );
      elements.push(<Text key="montant1"> d'un montant de </Text>);
      elements.push(
        <Text key="montant2" style={styles.boldText}>
          {formatCurrency(Number(p.montant))} DT
        </Text>
      );
    } else {
      const modeLabel = getPaymentModeLabel(p.modePaiement);
      elements.push(
        <Text key="mode" style={styles.boldText}>
          {modeLabel}
        </Text>
      );
      elements.push(<Text key="montant1"> d'un montant de </Text>);
      elements.push(
        <Text key="montant2" style={styles.boldText}>
          {formatCurrency(Number(p.montant))} DT
        </Text>
      );
    }
    return elements;
  };

  const renderSummarySection = () => {
    const bottomPos = 160;
    
    // ✅ Use finalTotal for Total TTC (same as FactureVentePDF)
    const totalTTC = finalTotal;
    
    return (
      <View style={[styles.summaryArea, { bottom: bottomPos }]}>
        <View style={styles.leftColumn}>
          {renderTVABreakdown()}
          {renderPaymentBoxUnderTVA()}
        </View>
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total H.T.:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(sousTotalHT)} DT
              </Text>
            </View>
            {Number(bonCommande.remise) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remise:</Text>
                <Text style={styles.summaryValue}>
                  - {formatCurrency(discountAmount)} DT
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net H.T.:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(netHT)} DT</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TVA:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(totalTax)} DT
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total TTC:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(totalTTC)} DT {/* Now 180.000 DT */}
              </Text>
            </View>
            
            {/* Affichage de l'acompte s'il existe */}
            {acompteTotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Acompte:</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(acompteTotal)} DT
                </Text>
              </View>
            )}
            
            {/* ADD RESTE À PAYER IN TOTALS BOX - UNDER ACOMPTE */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Reste à payer:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(resteAPayer)} DT
              </Text>
            </View>
            
            {/* NET À PAYER as table */}
            <View style={styles.netAPayerContainer}>
              <Text style={styles.netAPayerLabel}>NET À PAYER:</Text>
              <Text style={styles.netAPayerValue}>
                {formatCurrency(netAPayer)} DT {/* 180.000 DT */}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTable = (articles: any[], pageIndex: number, isContinuation: boolean = false) => (
    <View style={styles.tableContainer}>
 
      <View style={styles.tableHeader}>
        <View style={[styles.colN, styles.tableColHeader]}>
          <Text>N°</Text>
        </View>
        <View style={[styles.colArticle, styles.tableColHeader]}>
          <Text>ARTICLE</Text>
        </View>
        <View style={[styles.colDesignation, styles.tableColHeader]}>
          <Text>DESIGNATION</Text>
        </View>
        <View style={[styles.colQteC, styles.tableColHeader]}>
          <Text>QTE C</Text>
        </View>
        <View style={[styles.colQteLiv, styles.tableColHeader]}>
          <Text>QTE L</Text>
        </View>
        <View style={[styles.colPUHT, styles.tableColHeader]}>
          <Text>P.U.H.T</Text>
        </View>
        <View style={[styles.colTVA, styles.tableColHeader]}>
          <Text>TVA</Text>
        </View>
        <View style={[styles.colPUTTC, styles.tableColHeader]}>
          <Text>P.U.TTC</Text>
        </View>
        <View style={[styles.colMontantTTC, styles.tableColHeader]}>
          <Text>M.TTC</Text>
        </View>
      </View>
      {articles.map((item, index) => {
        const qty = Number(item.quantite) || 0;
        const qteLiv = Number(item.quantiteLivree) || 0;
        const priceHT = Number(item.prixUnitaire) || 0;
        const tvaRate = Number(item.tva) || 0;
        const prixTTC = Number(item.prix_ttc) || priceHT * (1 + tvaRate / 100);
        const montantTTC = Math.round(qty * prixTTC * 1000) / 1000;
        
        // Calculate global index based on pagination
        let globalIndex;
        if (pageIndex === 0) {
          globalIndex = index;
        } else {
          // For second page, start from 15 (since first page shows 15 articles)
          globalIndex = 15 + index;
        }
        
        return (
          <View style={styles.tableRow} key={index}>
            <View style={[styles.colN, styles.tableCol]}>
              <Text>{globalIndex + 1}</Text>
            </View>
            <View style={[styles.colArticle, styles.tableCol]}>
              <Text>{item.article?.reference || "-"}</Text>
            </View>
            <View style={[styles.colDesignation, styles.tableCol]}>
              <Text>{item.article?.designation || "-"}</Text>
            </View>
            <View style={[styles.colQteC, styles.tableCol]}>
              <Text>{qty}</Text>
            </View>
            <View style={[styles.colQteLiv, styles.tableCol]}>
              <Text>{qteLiv}</Text>
            </View>
            <View style={[styles.colPUHT, styles.tableCol]}>
              <Text>{formatCurrency(priceHT)}</Text>
            </View>
            <View style={[styles.colTVA, styles.tableCol]}>
              <Text>{tvaRate > 0 ? `${tvaRate}%` : "-"}</Text>
            </View>
            <View style={[styles.colPUTTC, styles.tableCol]}>
              <Text>{formatCurrency(prixTTC)}</Text>
            </View>
            <View style={[styles.colMontantTTC, styles.tableCol]}>
              <Text>{formatCurrency(montantTTC)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const safeBonCommande = bonCommande || {};
  const safeCompanyInfo = companyInfo || {};
  
  const renderPageHeader = (pageIndex: number) => (
    <>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          {companyInfo.logo && (
            <Image src={companyInfo.logo} style={styles.logo} />
          )}
        </View>
      </View>
      <View style={styles.commandeDetails}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View>
            <View style={styles.commandeDetailItem}>
              <Text style={styles.N}>
                 <Text style={styles.commandeNumberValue}>{bonCommande.numeroCommande || "N/A"}</Text>
              </Text>
            </View>
            <View style={[styles.commandeDetailItem, { marginTop: 4 }]}>
              <Text style={styles.commandeDetailLabel}>
                Date Commande: <Text style={styles.boldText}>
                  {bonCommande.dateCommande ? moment(bonCommande.dateCommande).format("DD/MM/YYYY") : "N/A"}
                </Text>
              </Text>
            </View>
            {bonCommande.dateLivBonCommande && (
  <View style={[styles.commandeDetailItem, { marginTop: 4}]}> {/* Add marginTop here */}
  <Text style={styles.commandeDetailLabel}>
      Date Livraison: <Text style={styles.boldText}>
        {moment(bonCommande.dateLivBonCommande).format("DD/MM/YYYY")}
      </Text>
    </Text>
  </View>
)}
          </View>
          <View style={styles.clientInfoContainer}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            {bonCommande.client && (
              <>
                {bonCommande.client.raison_sociale && (
                  wrapClientText(bonCommande.client.raison_sociale).map((line, index) => (
                    <Text key={`raison-${index}`} style={styles.clientLineItem}>
                      {line}
                    </Text>
                  ))
                )}
                {bonCommande.client.matricule_fiscal && (
                  <Text style={styles.clientLineItem}>MF: {bonCommande.client.matricule_fiscal}</Text>
                )}
                {bonCommande.client.adresse && (
                  wrapClientText(bonCommande.client.adresse).map((line, index) => (
                    <Text key={`adresse-${index}`} style={styles.clientLineItem}>
                      {line}
                    </Text>
                  ))
                )}
                {bonCommande.client.telephone1 && (
                  <Text style={styles.clientLineItem}>Tél: {bonCommande.client.telephone1}</Text>
                )}
                  {bonCommande.client.telephone2 && (
                  <Text style={styles.clientLineItem}>Tél: {bonCommande.client.telephone2}</Text>
                )}
              </>
            )}
          </View>
        </View>
      </View>
      <View style={styles.vendeurPaymentContainer}>
        <View style={styles.vendeurContainer}>
          <Text style={styles.sectionTitle}>VENDEUR</Text>
          {bonCommande.vendeur && (
            <Text style={styles.vendeurText}>
              {[bonCommande.vendeur.nom, bonCommande.vendeur.prenom].filter(Boolean).join(" ")}
            </Text>
          )}
        </View>
      </View>
    </>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerLine}>
        {[
          safeCompanyInfo.name,
          safeCompanyInfo.address,
          safeCompanyInfo.city,
          safeCompanyInfo.phone,
          safeCompanyInfo.gsm,
          safeCompanyInfo.taxId,
        ]
          .filter(Boolean)
          .join(" - ")}
      </Text>
      {safeCompanyInfo.email && safeCompanyInfo.website ? (
        <Text style={styles.footerLine}>
          Email: {safeCompanyInfo.email} | Site: {safeCompanyInfo.website}
        </Text>
      ) : safeCompanyInfo.email ? (
        <Text style={styles.footerLine}>Email: {safeCompanyInfo.email}</Text>
      ) : safeCompanyInfo.website ? (
        <Text style={styles.footerLine}>Site: {safeCompanyInfo.website}</Text>
      ) : null}
    </View>
  );

  const renderSummaryContent = () => {
    const amountBottom = 115;
    
    return (
      <>
        {renderSummarySection()}
        <View style={[styles.amountInWords, { bottom: amountBottom }]}>
          <Text style={styles.amountText}>
            Arrêté le présent bon de commande à la somme de : {amountInWords}
          </Text>
        </View>
        <View style={styles.cachetSignatureSection}>
          <View style={styles.signatureContainer}>
            <Text style={styles.signatureText}>Signature & Cachet</Text>
            <Text style={styles.subText}>Du Responsable</Text>
          </View>
          <View style={styles.cachetContainer}>
            <Text style={styles.cachetText}>Le Client</Text>
            <Text style={styles.subText}>Reçu conforme</Text>
            <Text style={styles.subText}>Signature & Cachet</Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <Document>
      {/* FIRST PAGE */}
      <Page key={0} size="A4" style={styles.page}>
        {renderPageHeader(0)}
        {renderTable(articlesFirstPage, 0)}
        {/* Show summary on first page ONLY for 1-10 articles */}
        {totalArticles <= 10 && renderSummaryContent()}
        {renderFooter()}
        <Text style={styles.pageNumber}>Page 1 sur {totalPages}</Text>
      </Page>
  
      {/* SECOND PAGE - For 11+ articles */}
      {needsSecondPage && (
        <Page key={1} size="A4" style={styles.page}>
          {renderPageHeader(1)}
          {/* Show table only if there are articles for second page (16+ articles case) */}
          {articlesSecondPage.length > 0 && renderTable(articlesSecondPage, 1, true)}
          {/* ALWAYS show summary on second page for 11+ articles */}
          {renderSummaryContent()}
          {renderFooter()}
          <Text style={styles.pageNumber}>Page 2 sur {totalPages}</Text>
        </Page>
      )}
    </Document>
  );
};

export default BonCommandePDF;