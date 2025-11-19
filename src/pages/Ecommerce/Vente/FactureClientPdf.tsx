// FacturePDF.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import moment from "moment";
import { FactureClient } from "../../../Components/Article/Interfaces";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 25,
    fontSize: 11,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottom: "1pt solid #000",
    paddingBottom: 8,
  },
  commandeDetails: {
    marginBottom: 8,
  },
  commandeDetailItem: {
    marginBottom: 3,
  },
  commandeDetailLabel: {
    fontSize: 13,
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
    marginBottom: 10,
    marginTop: 5,
  },
  vendeurInfo: {
    width: "35%",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  clientText: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: "bold",
  },
  vendeurText: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: "bold",
  },
  tableContainer: {
    marginBottom: 20,
    marginTop: 8,
    borderTop: "1pt solid #ddd",
    borderLeft: "1pt solid #ddd",
    borderRight: "1pt solid #ddd",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#00aeef",
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #ddd",
    paddingVertical: 8,
    minHeight: 28,
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
  colQuantite: { width: "8%" },
  colPUHT: { width: "12%", textAlign: "right" },
  colTVA: { width: "8%" },
  colPUTTC: { width: "12%", textAlign: "right" },
  colMontantTTC: { width: "10%", textAlign: "right" },
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  totalsContainer: {
    width: "40%",
  },
  tvaBreakdownContainer: {
    width: "50%",
  },
  totalsBox: {
    padding: 10,
    border: "1pt solid #ddd",
  },
  tvaBreakdownTable: {
    borderTop: "1pt solid #ddd",
    borderLeft: "1pt solid #ddd",
    borderRight: "1pt solid #ddd",
  },
  tvaBreakdownHeader: {
    flexDirection: "row",
    backgroundColor: "#00aeef",
    paddingVertical: 6,
  },
  tvaBreakdownRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #ddd",
    paddingVertical: 6,
  },
  tvaColTaux: {
    width: "25%",
    fontSize: 10,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  tvaColBase: {
    width: "35%",
    fontSize: 10,
    textAlign: "right",
    paddingHorizontal: 4,
  },
  tvaColMontant: {
    width: "40%",
    fontSize: 10,
    textAlign: "right",
    paddingHorizontal: 4,
  },
  tvaHeaderTaux: {
    width: "25%",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffffff",
    paddingHorizontal: 4,
  },
  tvaHeaderBase: {
    width: "35%",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    color: "#ffffff",
    paddingHorizontal: 4,
  },
  tvaHeaderMontant: {
    width: "40%",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    color: "#ffffff",
    paddingHorizontal: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryValue: {
    fontSize: 11,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTop: "1pt solid #ddd",
  },
  finalTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "2pt solid #333",
  },
  netAPayerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#00aeef",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "2pt solid #333",
    paddingHorizontal: 10,
    marginHorizontal: -10,
    marginBottom: -10,
    paddingBottom: 10,
  },
  cachetSignatureSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 85,
    left: 25,
    right: 25,
  },
  signatureContainer: {
    width: "35%",
    alignItems: "center",
  },
  cachetContainer: {
    width: "35%",
    alignItems: "center",
  },
  signatureText: {
    fontSize: 11,
    marginBottom: 3,
    fontWeight: "bold",
  },
  cachetText: {
    fontSize: 11,
    marginBottom: 3,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 9,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 5,
    left: 25,
    right: 25,
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
    bottom: 135,
    left: 25,
    right: 25,
    padding: 8,
    border: "1pt solid #ddd",
  },
  amountText: {
    fontSize: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
  pageNumber: {
    position: "absolute",
    bottom: 5,
    left: 25,
    fontSize: 8,
  },
  netAPayerLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    width: "60%",
  },
  netAPayerValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "right",
    width: "40%",
  },
  boldText: {
    fontWeight: "bold",
  },
  clientInfoContainer: {
    width: "60%",
    alignItems: "flex-start",
    left: "180",
  },
  clientLine: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: "bold",
    flexWrap: "wrap",
  },
});

interface FacturePDFProps {
  facture: FactureClient;
  companyInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    gsm: string;
    email: string;
    website: string;
    logo?: string;
    taxId: string;
  };
}

const FacturePDF: React.FC<FacturePDFProps> = ({ facture, companyInfo }) => {

  const exoneration = facture?.exoneration || false;

  // Safe calculation function with error handling
  const calculateTotals = () => {
    try {
      if (!facture?.articles || facture.articles.length === 0) {
        return {
          sousTotalHT: 0,
          netHT: 0,
          totalTax: 0,
          grandTotal: 0,
          finalTotal: 0,
          discountAmount: 0,
          tvaBreakdown: {},
        };
      }
  
      let sousTotalHTValue = 0;
      let netHTValue = 0;
      let totalTaxValue = 0;
      let grandTotalValue = 0;
      const tvaBreakdown: { [key: number]: { base: number; montant: number } } = {};
  
      // Calculate initial totals (KEEP EXACTLY THE SAME)
      facture.articles.forEach((item) => {
        const qty = Number(item.quantite) || 0;
        const priceHT = Number(item.prixUnitaire) || 0;
        const tvaRate = Number(item.tva || 0);
        const remiseRate = Number(item.remise || 0);
        const priceTTC = Number(item.prix_ttc) || priceHT * (1 + tvaRate / 100);
  
        const montantSousTotalHT = Math.round(qty * priceHT * 1000) / 1000;
        const montantNetHT = Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
        const montantTTCLigne = Math.round(qty * priceTTC * 1000) / 1000;
        const montantTVA = Math.round((montantTTCLigne - montantNetHT) * 1000) / 1000;
  
        sousTotalHTValue += montantSousTotalHT;
        netHTValue += montantNetHT;
        totalTaxValue += montantTVA;
        grandTotalValue += montantTTCLigne;
  
        if (tvaRate > 0) {
          if (!tvaBreakdown[tvaRate]) {
            tvaBreakdown[tvaRate] = { base: 0, montant: 0 };
          }
          tvaBreakdown[tvaRate].base += montantNetHT;
          tvaBreakdown[tvaRate].montant += montantTVA;
        }
      });
  
      sousTotalHTValue = Math.round(sousTotalHTValue * 1000) / 1000;
      netHTValue = Math.round(netHTValue * 1000) / 1000;
      totalTaxValue = Math.round(totalTaxValue * 1000) / 1000;
      grandTotalValue = Math.round(grandTotalValue * 1000) / 1000;
  
      let finalTotalValue = grandTotalValue;
      let discountAmountValue = 0;
  
      const remiseValue = Number(facture.remise) || 0;
      const remiseTypeValue = facture.remiseType || "percentage";
  
      if (remiseValue > 0) {
        if (remiseTypeValue === "percentage") {
          discountAmountValue = Math.round(netHTValue * (remiseValue / 100) * 1000) / 1000;
          const netHTAfterDiscount = Math.round((netHTValue - discountAmountValue) * 1000) / 1000;
          const discountRatio = netHTAfterDiscount / netHTValue;
  
          const totalTaxAfterDiscount = Math.round(totalTaxValue * discountRatio * 1000) / 1000;
          finalTotalValue = Math.round((netHTAfterDiscount + totalTaxAfterDiscount) * 1000) / 1000;
  
          Object.keys(tvaBreakdown).forEach((rate) => {
            const tvaRate = parseFloat(rate);
            tvaBreakdown[tvaRate].base = Math.round(tvaBreakdown[tvaRate].base * discountRatio * 1000) / 1000;
            tvaBreakdown[tvaRate].montant = Math.round(tvaBreakdown[tvaRate].montant * discountRatio * 1000) / 1000;
          });
  
          netHTValue = netHTAfterDiscount;
          totalTaxValue = totalTaxAfterDiscount;
        } else if (remiseTypeValue === "fixed") {
          finalTotalValue = Math.round(Number(remiseValue) * 1000) / 1000;
          const totalBeforeDiscount = netHTValue + totalTaxValue;
          const discountRatio = finalTotalValue / totalBeforeDiscount;
  
          const netHTAfterDiscount = Math.round(netHTValue * discountRatio * 1000) / 1000;
          const totalTaxAfterDiscount = Math.round(totalTaxValue * discountRatio * 1000) / 1000;
  
          discountAmountValue = Math.round((netHTValue - netHTAfterDiscount) * 1000) / 1000;
  
          Object.keys(tvaBreakdown).forEach((rate) => {
            const tvaRate = parseFloat(rate);
            tvaBreakdown[tvaRate].base = Math.round(tvaBreakdown[tvaRate].base * discountRatio * 1000) / 1000;
            tvaBreakdown[tvaRate].montant = Math.round(tvaBreakdown[tvaRate].montant * discountRatio * 1000) / 1000;
          });
  
          netHTValue = netHTAfterDiscount;
          totalTaxValue = totalTaxAfterDiscount;
        }
      }
  
      // APPLY EXONÉRATION - HARDCODED TRUE
      if (exoneration) {
        // Set TVA to 0 in breakdown
        Object.keys(tvaBreakdown).forEach((rateStr) => {
          const rate = parseFloat(rateStr);
          if (!isNaN(rate)) {
            tvaBreakdown[rate].montant = 0;
          }
        });
        totalTaxValue = 0;
        
        // SIMPLE CONDITION: If fixed amount remise exists, use it for both NET À PAYER and Net H.T.
        if (remiseTypeValue === "fixed" && remiseValue > 0) {
          finalTotalValue = Math.round(Number(remiseValue) * 1000) / 1000;
          netHTValue = finalTotalValue; // Net H.T. = Fixed amount
        } else {
          // If no fixed amount, use normal exonération logic
          finalTotalValue = netHTValue;
        }
      }
  
      if (facture.timbreFiscal) {
        finalTotalValue = Math.round((finalTotalValue + 1) * 1000) / 1000;
      }
  
      return {
        sousTotalHT: Math.round(sousTotalHTValue * 1000) / 1000,
        netHT: Math.round(netHTValue * 1000) / 1000,
        totalTax: Math.round(totalTaxValue * 1000) / 1000,
        grandTotal: Math.round(grandTotalValue * 1000) / 1000,
        finalTotal: Math.round(finalTotalValue * 1000) / 1000,
        discountAmount: Math.round(discountAmountValue * 1000) / 1000,
        tvaBreakdown,
      };
    } catch (error) {
      console.error("Error calculating totals:", error);
      return {
        sousTotalHT: 0,
        netHT: 0,
        totalTax: 0,
        grandTotal: 0,
        finalTotal: 0,
        discountAmount: 0,
        tvaBreakdown: {},
      };
    }
  };

  const {
    sousTotalHT,
    netHT,
    totalTax,
    grandTotal,
    finalTotal,
    discountAmount,
    tvaBreakdown,
  } = calculateTotals();

  const formatCurrency = (amount: number) => {
    return amount.toFixed(3);
  };

  const numberToWords = (num: number): string => {
    try {
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

      if (integerPart === 0) {
        return "Zéro dinars zéro millime uniquement";
      }

      let words = "";

      if (integerPart >= 1000) {
        const thousands = Math.floor(integerPart / 1000);
        if (thousands === 1) {
          words += "mille";
        } else if (thousands < 10) {
          words += units[thousands] + " mille";
        } else if (thousands < 20) {
          words += teens[thousands - 10] + " mille";
        } else if (thousands < 100) {
          const ten = Math.floor(thousands / 10);
          const unit = thousands % 10;
          words += tens[ten];
          if (unit > 0) {
            if (ten === 7 || ten === 9) {
              words += "-" + teens[unit];
            } else {
              words += "-" + units[unit];
            }
          }
          words += " mille";
        }

        const remainder = integerPart % 1000;
        if (remainder > 0) {
          words += " ";
        }
      }

      const remainder = integerPart % 1000;
      if (remainder >= 100) {
        const hundreds = Math.floor(remainder / 100);
        if (hundreds === 1) {
          words += "cent";
        } else {
          words += units[hundreds] + " cent";
        }
        const smallRemainder = remainder % 100;
        if (smallRemainder > 0) {
          words += " ";
        }
      }

      const smallRemainder = remainder % 100;
      if (smallRemainder > 0) {
        if (smallRemainder < 10) {
          words += units[smallRemainder];
        } else if (smallRemainder < 20) {
          words += teens[smallRemainder - 10];
        } else {
          const ten = Math.floor(smallRemainder / 10);
          const unit = smallRemainder % 10;
          words += tens[ten];
          if (unit > 0) {
            if (ten === 7 || ten === 9) {
              words += "-" + teens[unit];
            } else {
              words += "-" + units[unit];
            }
          }
        }
      }

      words += " dinars zéro millime";

      return words.charAt(0).toUpperCase() + words.slice(1) + " uniquement";
    } catch (error) {
      console.error("Error converting number to words:", error);
      return "Montant en dinars uniquement";
    }
  };

  const amountInWords = numberToWords(finalTotal);

  // Function to wrap text if it exceeds 25 characters
  const wrapText = (text: string, maxLength: number = 25): string[] => {
    if (!text || text.length <= maxLength) {
      return [text];
    }

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + " " + word).length > maxLength) {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + " " + word : word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Safe article chunking
  const articlesPerPage = 12;
  const articleChunks = [];
  const articles = facture?.articles || [];
  for (let i = 0; i < articles.length; i += articlesPerPage) {
    articleChunks.push(articles.slice(i, i + articlesPerPage));
  }

  // If no articles, still create one page
  if (articleChunks.length === 0) {
    articleChunks.push([]);
  }

  const renderTable = (articles: any[], pageIndex: number) => (
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
        <View style={[styles.colQuantite, styles.tableColHeader]}>
          <Text>QTE</Text>
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
        const priceHT = Number(item.prixUnitaire) || 0;
        const tvaRate = Number(item.tva) || 0;
        const remiseRate = Number(item.remise || 0);

        // Use stored TTC price or calculate it
        const priceTTC = Number(item.prix_ttc) || priceHT * (1 + tvaRate / 100);

        // Line calculations - consistent with main logic
        const montantSousTotalHT = Math.round(qty * priceHT * 1000) / 1000;
        const montantNetHT =
          Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
        const montantTTCLigne = Math.round(qty * priceTTC * 1000) / 1000;
        const montantTVA =
          Math.round((montantTTCLigne - montantNetHT) * 1000) / 1000;

        return (
          <View style={styles.tableRow} key={index}>
            <View style={[styles.colN, styles.tableCol]}>
              <Text>{pageIndex * articlesPerPage + index + 1}</Text>
            </View>
            <View style={[styles.colArticle, styles.tableCol]}>
              <Text>{item.article?.reference || "-"}</Text>
            </View>
            <View style={[styles.colDesignation, styles.tableCol]}>
              <Text>{item.article?.designation || "-"}</Text>
            </View>
            <View style={[styles.colQuantite, styles.tableCol]}>
              <Text>{qty}</Text>
            </View>
            <View style={[styles.colPUHT, styles.tableCol]}>
              <Text>{formatCurrency(priceHT)}</Text>
            </View>
            <View style={[styles.colTVA, styles.tableCol]}>
              <Text>{tvaRate > 0 ? `${tvaRate}%` : "-"}</Text>
            </View>
            <View style={[styles.colPUTTC, styles.tableCol]}>
              <Text>{formatCurrency(priceTTC)}</Text>
            </View>
            <View style={[styles.colMontantTTC, styles.tableCol]}>
              <Text>{formatCurrency(montantTTCLigne)}</Text>
            </View>
          </View>
        );
      })}
      {/* Empty state */}
      {articles.length === 0 && (
        <View style={styles.tableRow}>
          <View
            style={[styles.colDesignation, styles.tableCol, { width: "100%" }]}
          >
            <Text>Aucun article</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderTVABreakdown = () => {
    const tvaRates = Object.keys(tvaBreakdown)
      .map(rate => parseFloat(rate))
      .filter(rate => !isNaN(rate))
      .sort((a, b) => a - b);
  
    return (
      <View style={styles.tvaBreakdownContainer}>
        <View style={styles.tvaBreakdownTable}>
          <View style={styles.tvaBreakdownHeader}>
            <Text style={styles.tvaHeaderTaux}>Taux TVA</Text>
            <Text style={styles.tvaHeaderBase}>Base H.T.</Text>
            <Text style={styles.tvaHeaderMontant}>MT TVA</Text>
          </View>
          
          {/* Only show Exonoré line when exoneration is true */}
          {exoneration && (
            <View style={styles.tvaBreakdownRow}>
              <Text style={styles.tvaColTaux}>Exonoré</Text>
              <Text style={styles.tvaColBase}>
                {formatCurrency(
                  Object.values(tvaBreakdown).reduce((sum, item) => sum + item.base, 0)
                )} DT
              </Text>
              <Text style={styles.tvaColMontant}>0,000 DT</Text>
            </View>
          )}
         
          {/* Show TVA rates */}
          {tvaRates.map(rate => (
            <View style={styles.tvaBreakdownRow} key={rate}>
              <Text style={styles.tvaColTaux}>{rate}%</Text>
              <Text style={styles.tvaColBase}>{formatCurrency(tvaBreakdown[rate].base)} DT</Text>
              <Text style={styles.tvaColMontant}>
                {exoneration ? "0,000" : formatCurrency(tvaBreakdown[rate].montant)} DT
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSummarySection = () => {
    return (
      <View style={styles.summarySection}>
        {renderTVABreakdown()}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TOTAL H.T.:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(sousTotalHT)} DT
              </Text>
            </View>

            {Number(facture?.remise) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Remise :
                
                </Text>
                <Text>
                  - {formatCurrency(discountAmount)} DT
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net H.T.:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(netHT)} DT
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TVA:</Text>
              <Text style={styles.summaryValue}>
                {exoneration ? "0,000" : formatCurrency(totalTax)} DT
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total TTC:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(grandTotal)} DT
              </Text>
            </View>

            {facture?.timbreFiscal && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Timbre Fiscal:</Text>
                <Text style={styles.summaryValue}>1,000 DT</Text>
              </View>
            )}

            <View style={styles.finalTotalRow}>
              <Text style={[styles.summaryLabel, styles.boldText]}>
                NET À PAYER:
              </Text>
              <Text style={[styles.summaryValue, styles.boldText]}>
                {formatCurrency(finalTotal)} DT
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Safe data access
  const safeFacture = facture || {};
  const safeCompanyInfo = companyInfo || {};

  return (
    <Document>
      {articleChunks.map((articles, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.companyInfo}>
              {safeCompanyInfo.logo && (
                <Image src={safeCompanyInfo.logo} style={styles.logo} />
              )}
            </View>
          </View>

          {/* Invoice and Client Details */}
          <View style={styles.commandeDetails}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View>
                <View style={styles.commandeDetailItem}>
                  <Text style={styles.commandeDetailLabel}>
                    N°: <Text style={styles.boldText}>FACTURE-001/2025</Text>
                  </Text>
                </View>
                <View style={styles.commandeDetailItem}>
                  <Text style={styles.commandeDetailLabel}>
                    Date:{" "}
                    <Text style={styles.boldText}>
                      {safeFacture.dateFacture
                        ? moment(safeFacture.dateFacture).format("DD/MM/YYYY")
                        : "N/A"}
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.clientInfoContainer}>
                <Text style={styles.sectionTitle}>CLIENT</Text>
                {safeFacture.client?.raison_sociale &&
                  wrapText(safeFacture.client.raison_sociale).map(
                    (line, index) => (
                      <Text style={styles.clientLine} key={`raison-${index}`}>
                        {line}
                      </Text>
                    )
                  )}
                {safeFacture.client?.matricule_fiscal && (
                  <Text style={styles.clientLine}>
                    MF: {safeFacture.client.matricule_fiscal}
                  </Text>
                )}
                {safeFacture.client?.adresse &&
                  wrapText(safeFacture.client.adresse).map((line, index) => (
                    <Text style={styles.clientLine} key={`adresse-${index}`}>
                      {line}
                    </Text>
                  ))}
                {safeFacture.client?.telephone1 && (
                  <Text style={styles.clientLine}>
                    Tél: {safeFacture.client.telephone1}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Vendeur section */}
          <View style={styles.clientVendeurSection}>
            <View style={styles.vendeurInfo}>
              <Text style={styles.sectionTitle}>VENDEUR</Text>
              {safeFacture.vendeur && (
                <Text style={styles.vendeurText}>
                  {[safeFacture.vendeur.nom, safeFacture.vendeur.prenom]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              )}
            </View>
          </View>

          {/* Table */}
          {renderTable(articles, pageIndex)}

          {/* Summary Section with TVA Breakdown (only on last page) */}
          {pageIndex === articleChunks.length - 1 && renderSummarySection()}

          {/* Amount in Words - Above signatures */}
          {pageIndex === articleChunks.length - 1 && (
            <View style={styles.amountInWords}>
              <Text style={styles.amountText}>
                Arrêtée la présente facture à la somme de : {amountInWords}
              </Text>
            </View>
          )}

          {/* Signature Section (only on last page) */}
          {pageIndex === articleChunks.length - 1 && (
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
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerLine}>
              {safeCompanyInfo.name || ""} - {safeCompanyInfo.address || ""} -{" "}
              {safeCompanyInfo.city || ""} - Tél: {safeCompanyInfo.phone || ""}{" "} - Gsm: {safeCompanyInfo.gsm || ""}{" "}
              - MF: {safeCompanyInfo.taxId || ""}
            </Text>
            {safeCompanyInfo.email && (
              <Text style={styles.footerLine}>
                Email: {safeCompanyInfo.email}{" "}
                {safeCompanyInfo.website &&
                  `| Site: ${safeCompanyInfo.website}`}
              </Text>
            )}
          </View>

          {/* Page Number */}
          <Text style={styles.pageNumber}>
            Page {pageIndex + 1} sur {articleChunks.length}
          </Text>
        </Page>
      ))}
    </Document>
  );
};

export default FacturePDF;
