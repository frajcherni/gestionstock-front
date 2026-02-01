// src/Components/CommandeClient/BonLivraisonPDF.tsx
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
import { BonLivraison } from "../../../Components/Article/Interfaces";

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
  livraisonDetails: {
    marginBottom: 6,
  },
  livraisonDetailItem: {
    marginBottom: 2,
  },
  livraisonDetailLabel: {
    fontSize: 13,
  },
  N: {
    fontSize: 15,
  },
  livraisonNumberValue: {
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
    marginTop: 16,
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
  colArticle: { width: "18%", textAlign: "left" },
  colDesignation: { width: "29%", textAlign: "left" },
  colQteC: { width: "10%" },
  colQteLiv: { width: "12%" },
  colPUHT: { width: "12%", textAlign: "right" },
  colTVA: { width: "9%" },
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
  // NEW: Delivery Info Box - Same style as totals box
  deliveryInfoBox: {
    padding: 8,
    border: "1pt solid #ddd",
    width: "100%",
    marginBottom: 10,
  },
  deliveryInfoHeader: {
    backgroundColor: "#00aeef",
    paddingVertical: 4,
    paddingHorizontal: 8,
    margin: -8,
    marginBottom: 8,
  },
  deliveryInfoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  deliveryInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  deliveryInfoItem: {
    width: "48%",
  },
  deliveryInfoLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  deliveryInfoValue: {
    fontSize: 10,
  },
  totalsContainer: { 
    width: "40%",
    marginLeft: "auto",
  },
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
  vendeurPaymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  vendeurContainer: {
    width: '55%',
  },
});

interface BonLivraisonPDFProps {
  bonLivraison: BonLivraison;
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

const BonLivraisonPDF: React.FC<BonLivraisonPDFProps> = ({
  bonLivraison,
  companyInfo,
}) => {
  // Check if BL is linked to a BC
  const isLinkedToBC = !!bonLivraison.bonCommandeClient;

  // Check if delivery information exists
  const hasDeliveryInfo = bonLivraison.voiture || bonLivraison.serie || bonLivraison.chauffeur || bonLivraison.cin;


  const calculateTotals = () => {
    if (!bonLivraison?.articles || bonLivraison.articles.length === 0) {
      return {
        sousTotalHT: 0,
        netHT: 0,
        totalTax: 0,
        grandTotal: 0,
        finalTotal: 0,
        discountAmount: 0,
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
  
    // Calculate original line amounts (with line-level discounts only)
    bonLivraison.articles.forEach((article) => {
      const qty = Number(article.quantite) || 0;
      const articleRemise = Number(article.remise) || 0;
      const tvaRate = Number(article.tva) || 0;
      
      let unitHT = Number(article.prix_unitaire) || 0;
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
    });
  
    // Round original totals
    sousTotalHTValue = Math.round(sousTotalHTValue * 1000) / 1000;
    totalTaxValue = Math.round(totalTaxValue * 1000) / 1000;
    grandTotalValue = Math.round(grandTotalValue * 1000) / 1000;
  
    let finalTotalValue = grandTotalValue;
    let discountAmountValue = 0;
    let netHTValue = sousTotalHTValue;
    
    // Apply document-level remise if exists
    const remiseValue = Number(bonLivraison.remise) || 0;
    const remiseTypeValue = bonLivraison.remiseType || "percentage";
  
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
        
      } else if (remiseTypeValue === "fixed") {
        // ✅ FIXED DISCOUNT FORMULA: TTC is given, calculate HT
        finalTotalValue = Math.round(Number(remiseValue) * 1000) / 1000;
        
        // Find all unique TVA rates
        const tvaRates = Array.from(new Set(bonLivraison.articles.map(a => Number(a.tva) || 0)));
        
        if (tvaRates.length === 1 && tvaRates[0] > 0) {
          // ✅ SINGLE TVA RATE: HT = TTC / (1 + TVA rate)
          const tvaRate = tvaRates[0];
          netHTValue = Math.round((finalTotalValue / (1 + tvaRate / 100)) * 1000) / 1000;
          totalTaxValue = Math.round((finalTotalValue - netHTValue) * 1000) / 1000;
          
        } else {
          // ✅ MULTIPLE TVA RATES: Use proportional method
          const discountCoefficient = grandTotalValue > 0 ? finalTotalValue / grandTotalValue : 0;
          
          // Reset values
          netHTValue = 0;
          totalTaxValue = 0;
          
          // Recalculate each line proportionally
          bonLivraison.articles.forEach((article) => {
            const qty = Number(article.quantite) || 0;
            const articleRemise = Number(article.remise) || 0;
            const tvaRate = Number(article.tva) || 0;
            let unitHT = Number(article.prix_unitaire) || 0;
            
            // Calculate original line amounts
            const montantNetHTLigne = Math.round(
              qty * unitHT * (1 - articleRemise / 100) * 1000
            ) / 1000;
            
            // Apply coefficient to get new amounts
            const newLineHT = Math.round((montantNetHTLigne * discountCoefficient) * 1000) / 1000;
            const newLineTVA = Math.round((newLineHT * (tvaRate / 100)) * 1000) / 1000;
            
            netHTValue += newLineHT;
            totalTaxValue += newLineTVA;
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
    }
  
    return {
      sousTotalHT: Math.round(sousTotalHTValue * 1000) / 1000,
      netHT: Math.round(netHTValue * 1000) / 1000,
      totalTax: Math.round(totalTaxValue * 1000) / 1000,
      grandTotal: Math.round(grandTotalValue * 1000) / 1000,
      finalTotal: Math.round(finalTotalValue * 1000) / 1000,
      discountAmount: Math.round(discountAmountValue * 1000) / 1000,
    };
  };
  
  const {
    sousTotalHT,
    netHT,
    totalTax,
    grandTotal,
    finalTotal,
    discountAmount,
  } = calculateTotals();
  
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

  const amountInWords = numberToWords(finalTotal);

  // Render delivery information box
  const renderDeliveryInfoBox = () => {
    if (!hasDeliveryInfo) return null;

    return (
      <View style={styles.deliveryInfoBox}>
        <View style={styles.deliveryInfoHeader}>
          <Text style={styles.deliveryInfoTitle}>INFORMATIONS DE LIVRAISON</Text>
        </View>
        <View style={styles.deliveryInfoRow}>
          <View style={styles.deliveryInfoItem}>
            <Text style={styles.deliveryInfoLabel}>Voiture:</Text>
            <Text style={styles.deliveryInfoValue}>{bonLivraison.voiture || "Non spécifié"}</Text>
          </View>
          <View style={styles.deliveryInfoItem}>
            <Text style={styles.deliveryInfoLabel}>Série:</Text>
            <Text style={styles.deliveryInfoValue}>{bonLivraison.serie || "Non spécifié"}</Text>
          </View>
        </View>
        <View style={styles.deliveryInfoRow}>
          <View style={styles.deliveryInfoItem}>
            <Text style={styles.deliveryInfoLabel}>Chauffeur:</Text>
            <Text style={styles.deliveryInfoValue}>{bonLivraison.chauffeur || "Non spécifié"}</Text>
          </View>
          <View style={styles.deliveryInfoItem}>
            <Text style={styles.deliveryInfoLabel}>CIN:</Text>
            <Text style={styles.deliveryInfoValue}>{bonLivraison.cin || "Non spécifié"}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSummarySection = () => {
    const bottomPos = 160;
    
    return (
      <View style={[styles.summaryArea, { bottom: bottomPos }]}>
        <View style={styles.leftColumn}>
          {renderDeliveryInfoBox()}
        </View>
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total H.T.:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(sousTotalHT)} DT
              </Text>
            </View>
            
            {Number(bonLivraison.remise) > 0 && (
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
                {formatCurrency(finalTotal)} DT
              </Text>
            </View>
            
            {/* NET À PAYER - Same as Facture */}
            <View style={styles.netAPayerContainer}>
              <Text style={styles.netAPayerLabel}>NET À PAYER:</Text>
              <Text style={styles.netAPayerValue}>
                {formatCurrency(finalTotal)} DT
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTable = (articles: any[]) => (
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
        
        // BC quantities if linked
        let qteC = 0;
        if (isLinkedToBC && bonLivraison.bonCommandeClient?.articles) {
          const bcArticle = bonLivraison.bonCommandeClient.articles.find(
            (bcArt: any) => bcArt.article_id === item.article_id || bcArt.article?.id === item.article?.id
          );
          if (bcArticle) {
            qteC = Number(bcArticle.quantite) || 0;
          }
        }
        
        const priceHT = Number(item.prix_unitaire) || 0;
        const tvaRate = Number(item.tva) || 0;
        const prixTTC = Number(item.prix_ttc) || priceHT * (1 + tvaRate / 100);
        const montantTTC = Math.round(qty * prixTTC * 1000) / 1000;

        return (
          <View style={styles.tableRow} key={index}>
            <View style={[styles.colN, styles.tableCol]}>
              <Text>{index + 1}</Text>
            </View>
            <View style={[styles.colArticle, styles.tableCol]}>
              <Text>{item.article?.reference || "-"}</Text>
            </View>
            <View style={[styles.colDesignation, styles.tableCol]}>
              <Text>{item.article?.designation || "-"}</Text>
            </View>
     
            <View style={[styles.colQteLiv, styles.tableCol]}>
              <Text>{qty}</Text>
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

  const renderPageHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          {companyInfo.logo && (
            <Image src={companyInfo.logo} style={styles.logo} />
          )}
        </View>
      </View>
      <View style={styles.livraisonDetails}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View>
            <View style={styles.livraisonDetailItem}>
              <Text style={styles.N}>
                 <Text style={styles.livraisonNumberValue}>{bonLivraison.numeroLivraison || "N/A"}</Text>
              </Text>
            </View>
            <View style={styles.livraisonDetailItem}>
              <Text style={styles.livraisonDetailLabel}>
                Date: <Text style={styles.boldText}>
                  {bonLivraison.dateLivraison ? moment(bonLivraison.dateLivraison).format("DD/MM/YYYY") : "N/A"}
                </Text>
              </Text>
            </View>
            {isLinkedToBC && (
              <View style={styles.livraisonDetailItem}>
                <Text style={styles.livraisonDetailLabel}>
                  Commande: <Text style={styles.boldText}>
                    {bonLivraison.bonCommandeClient?.numeroCommande || "N/A"}
                  </Text>
                </Text>
              </View>
            )}
          </View>
          <View style={styles.clientInfoContainer}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            {bonLivraison.client && (
              <>
                {bonLivraison.client.raison_sociale && (
                  <Text style={styles.clientLineItem}>
                    {bonLivraison.client.raison_sociale}
                  </Text>
                )}
                {bonLivraison.client.matricule_fiscal && (
                  <Text style={styles.clientLineItem}>MF: {bonLivraison.client.matricule_fiscal}</Text>
                )}
                {bonLivraison.client.adresse && (
                  <Text style={styles.clientLineItem}>
                    {bonLivraison.client.adresse}
                  </Text>
                )}
                {bonLivraison.client.telephone1 && (
                  <Text style={styles.clientLineItem}>Tél: {bonLivraison.client.telephone1}</Text>
                )}
                 {bonLivraison.client.telephone2 && (
                  <Text style={styles.clientLineItem}>Tél: {bonLivraison.client.telephone2}</Text>
                )}
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.vendeurPaymentContainer}>
        <View style={styles.vendeurContainer}>
          <Text style={styles.sectionTitle}>VENDEUR</Text>
          {bonLivraison.vendeur && (
            <Text style={styles.vendeurText}>
              {[bonLivraison.vendeur.nom, bonLivraison.vendeur.prenom].filter(Boolean).join(" ")}
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
          companyInfo.name,
          companyInfo.address,
          companyInfo.city,
          companyInfo.phone,
          companyInfo.gsm,
          companyInfo.taxId,
        ]
          .filter(Boolean)
          .join(" - ")}
      </Text>
      {companyInfo.email && companyInfo.website ? (
        <Text style={styles.footerLine}>
          Email: {companyInfo.email} | Site: {companyInfo.website}
        </Text>
      ) : companyInfo.email ? (
        <Text style={styles.footerLine}>Email: {companyInfo.email}</Text>
      ) : companyInfo.website ? (
        <Text style={styles.footerLine}>Site: {companyInfo.website}</Text>
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
            Arrêté le présent bon de livraison à la somme de : {amountInWords}
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
      <Page size="A4" style={styles.page}>
        {renderPageHeader()}
        {renderTable(bonLivraison.articles || [])}
        {renderSummaryContent()}
        {renderFooter()}
        <Text style={styles.pageNumber}>Page 1 sur 1</Text>
      </Page>
    </Document>
  );
};

export default BonLivraisonPDF;