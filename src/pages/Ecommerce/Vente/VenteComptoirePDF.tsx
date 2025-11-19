import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import moment from "moment";
import { BonCommandeClient } from "../../../Components/Article/Interfaces";

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 25,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottom: '1pt solid #000',
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
    width: '60%'
  },
  logo: {
    width: 200,
    marginBottom: 5
  },
  clientVendeurSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 5,
  },
  vendeurInfo: {
    width: '35%',
    alignItems: 'flex-start'
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  clientText: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  vendeurText: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  tableContainer: {
    marginBottom: 20,
    marginTop: 8,
    borderTop: '1pt solid #ddd',
    borderLeft: '1pt solid #ddd',
    borderRight: '1pt solid #ddd',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#00aeef',
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ddd',
    paddingVertical: 8,
    minHeight: 28,
  },
  tableColHeader: {
    paddingHorizontal: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#ffffff',
  },
  tableCol: {
    paddingHorizontal: 4,
    fontSize: 10,
    textAlign: 'center',
  },
  colN: { width: '5%' },
  colArticle: { width: '15%', textAlign: 'left' },
  colDesignation: { width: '30%', textAlign: 'left' },
  colQuantite: { width: '8%' },
  colPUHT: { width: '12%', textAlign: 'right' },
  colTVA: { width: '8%' },
  colPUTTC: { width: '12%', textAlign: 'right' },
  colMontantTTC: { width: '10%', textAlign: 'right' },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalsContainer: {
    width: '40%',
  },
  tvaBreakdownContainer: {
    width: '50%',
  },
  totalsBox: {
    padding: 10,
    border: '1pt solid #ddd',
  },
  tvaBreakdownTable: {
    borderTop: '1pt solid #ddd',
    borderLeft: '1pt solid #ddd',
    borderRight: '1pt solid #ddd',
  },
  tvaBreakdownHeader: {
    flexDirection: 'row',
    backgroundColor: '#00aeef',
    paddingVertical: 6,
  },
  tvaBreakdownRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ddd',
    paddingVertical: 6,
  },
  tvaColTaux: {
    width: '25%',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tvaColBase: {
    width: '35%',
    fontSize: 10,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  tvaColMontant: {
    width: '40%',
    fontSize: 10,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  tvaHeaderTaux: {
    width: '25%',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    paddingHorizontal: 4,
  },
  tvaHeaderBase: {
    width: '35%',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#ffffff',
    paddingHorizontal: 4,
  },
  tvaHeaderMontant: {
    width: '40%',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#ffffff',
    paddingHorizontal: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryValue: {
    fontSize: 11,
  },
  netAPayerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#00aeef',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '2pt solid #333',
    paddingHorizontal: 10,
    marginHorizontal: -10,
    marginBottom: -10,
    paddingBottom: 10,
  },
  netAPayerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    width: '60%',
  },
  netAPayerValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'right',
    width: '40%',
  },
  cachetSignatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 85,
    left: 25,
    right: 25,
  },
  signatureContainer: {
    width: '35%',
    alignItems: 'center',
  },
  cachetContainer: {
    width: '35%',
    alignItems: 'center',
  },
  signatureText: {
    fontSize: 11,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  cachetText: {
    fontSize: 11,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 9,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 5,
    left: 25,
    right: 25,
    textAlign: 'center',
    fontSize: 8,
    borderTop: '1pt solid #ddd',
    paddingTop: 3,
  },
  footerLine: {
    marginBottom: 1
  },
  amountInWords: {
    position: 'absolute',
    bottom: 135,
    left: 25,
    right: 25,
    padding: 8,
    border: '1pt solid #ddd',
  },
  amountText: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 5,
    left: 25,
    fontSize: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  clientInfoContainer: {
    width: '60%',
    alignItems: 'flex-start',
    left: '180'
  },
  clientLine: {
    fontSize: 10,
    marginBottom: 2,
    fontWeight: 'bold',
    flexWrap: 'wrap'
  },
  // Add continuation header style for subsequent pages
  continuationHeader: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  }
});

interface FactureVentePDFProps {
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
    gsm : string;
  };
}

const FactureVentePDF: React.FC<FactureVentePDFProps> = ({ bonCommande, companyInfo }) => {
  // Calculate totals exactly like in BonCommandeClientList useMemo
  const calculateTotals = () => {
    if (!bonCommande?.articles || bonCommande.articles.length === 0) {
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

    // Calculate initial totals with proper rounding
    bonCommande.articles.forEach((article) => {
      const qty = Number(article.quantite) || 0;
      const tvaRate = Number(article.tva) || 0;
      const remiseRate = Number(article.remise) || 0;
      
      const priceHT = Number(article.prixUnitaire) || 0;
      const priceTTC = priceHT * (1 + tvaRate / 100);

      // Calculate line amounts exactly like bon commande
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

    // Round accumulated values
    sousTotalHTValue = Math.round(sousTotalHTValue * 1000) / 1000;
    netHTValue = Math.round(netHTValue * 1000) / 1000;
    totalTaxValue = Math.round(totalTaxValue * 1000) / 1000;
    grandTotalValue = Math.round(grandTotalValue * 1000) / 1000;

    let finalTotalValue = grandTotalValue;
    let discountAmountValue = 0;
    let netHTAfterDiscount = netHTValue;
    let totalTaxAfterDiscount = totalTaxValue;

    // Apply remise logic with proper rounding exactly like bon commande
    const remiseValue = Number(bonCommande.remise) || 0;
    const remiseTypeValue = bonCommande.remiseType || "percentage";

    if (remiseValue > 0) {
      if (remiseTypeValue === "percentage") {
        discountAmountValue = Math.round(netHTValue * (remiseValue / 100) * 1000) / 1000;
        netHTAfterDiscount = Math.round((netHTValue - discountAmountValue) * 1000) / 1000;
        
        const discountRatio = netHTAfterDiscount / netHTValue;
        totalTaxAfterDiscount = Math.round(totalTaxValue * discountRatio * 1000) / 1000;
        
        // Update TVA breakdown with discounted amounts
        Object.keys(tvaBreakdown).forEach(rate => {
          const tvaRate = parseFloat(rate);
          tvaBreakdown[tvaRate].base = Math.round(tvaBreakdown[tvaRate].base * discountRatio * 1000) / 1000;
          tvaBreakdown[tvaRate].montant = Math.round(tvaBreakdown[tvaRate].montant * discountRatio * 1000) / 1000;
        });
        
        finalTotalValue = Math.round((netHTAfterDiscount + totalTaxAfterDiscount) * 1000) / 1000;
        
      } else if (remiseTypeValue === "fixed") {
        finalTotalValue = Math.round(Number(remiseValue) * 1000) / 1000;
        
        const tvaToHtRatio = totalTaxValue / netHTValue;
        const htAfterDiscount = Math.round(finalTotalValue / (1 + tvaToHtRatio) * 1000) / 1000;
        
        discountAmountValue = Math.round((netHTValue - htAfterDiscount) * 1000) / 1000;
        netHTAfterDiscount = htAfterDiscount;
        totalTaxAfterDiscount = Math.round(netHTAfterDiscount * tvaToHtRatio * 1000) / 1000;
        
        const discountRatio = netHTAfterDiscount / netHTValue;
        
        // Update TVA breakdown with discounted amounts
        Object.keys(tvaBreakdown).forEach(rate => {
          const tvaRate = parseFloat(rate);
          tvaBreakdown[tvaRate].base = Math.round(tvaBreakdown[tvaRate].base * discountRatio * 1000) / 1000;
          tvaBreakdown[tvaRate].montant = Math.round(tvaBreakdown[tvaRate].montant * discountRatio * 1000) / 1000;
        });
      }
    }

    // Use discounted values for final display
    const displayNetHT = remiseValue > 0 ? netHTAfterDiscount : netHTValue;
    const displayTotalTax = remiseValue > 0 ? totalTaxAfterDiscount : totalTaxValue;

    return {
      sousTotalHT: Math.round(sousTotalHTValue * 1000) / 1000,
      netHT: Math.round(displayNetHT * 1000) / 1000,
      totalTax: Math.round(displayTotalTax * 1000) / 1000,
      grandTotal: Math.round(grandTotalValue * 1000) / 1000,
      finalTotal: Math.round(finalTotalValue * 1000) / 1000,
      discountAmount: Math.round(discountAmountValue * 1000) / 1000,
      tvaBreakdown,
    };
  };

  const { sousTotalHT, netHT, totalTax, grandTotal, finalTotal, discountAmount, tvaBreakdown } = calculateTotals();

  // Format currency with 3 decimal places
  const formatCurrency = (amount: number) => {
    return amount.toFixed(3);
  };

  // Number to words conversion (same as BonCommandePDF)
  const numberToWords = (num: number): string => {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    
    const integerPart = Math.floor(num);
    
    if (integerPart === 0) {
      return 'Zéro dinars zéro millime uniquement';
    }
    
    let words = '';
    
    // Handle thousands
    if (integerPart >= 1000) {
      const thousands = Math.floor(integerPart / 1000);
      if (thousands === 1) {
        words += 'mille';
      } else if (thousands < 10) {
        words += units[thousands] + ' mille';
      } else if (thousands < 20) {
        words += teens[thousands - 10] + ' mille';
      } else if (thousands < 100) {
        const ten = Math.floor(thousands / 10);
        const unit = thousands % 10;
        words += tens[ten];
        if (unit > 0) {
          if (ten === 7 || ten === 9) {
            words += '-' + teens[unit];
          } else {
            words += '-' + units[unit];
          }
        }
        words += ' mille';
      }
      
      const remainder = integerPart % 1000;
      if (remainder > 0) {
        words += ' ';
      }
    }
    
    // Handle hundreds for the remainder
    const remainder = integerPart % 1000;
    if (remainder >= 100) {
      const hundreds = Math.floor(remainder / 100);
      if (hundreds === 1) {
        words += 'cent';
      } else {
        words += units[hundreds] + ' cent';
      }
      const smallRemainder = remainder % 100;
      if (smallRemainder > 0) {
        words += ' ';
      }
    }
    
    // Handle tens and units for the small remainder
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
            words += '-' + teens[unit];
          } else {
            words += '-' + units[unit];
          }
        }
      }
    }
    
    words += ' dinars zéro millime';
    
    return words.charAt(0).toUpperCase() + words.slice(1) + ' uniquement';
  };

  const amountInWords = numberToWords(finalTotal);

  // Text wrapping function
  const wrapText = (text: string, maxLength: number = 25): string[] => {
    if (!text || text.length <= maxLength) return [text];
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + ' ' + word).length > maxLength) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Pagination logic - same as BonCommandePDF and FacturePDF
  const articlesPerPage = 12;
  const articleChunks: any[][] = [];
  const articles = bonCommande?.articles || [];
  
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
        <View style={[styles.colN, styles.tableColHeader]}><Text>N°</Text></View>
        <View style={[styles.colArticle, styles.tableColHeader]}><Text>ARTICLE</Text></View>
        <View style={[styles.colDesignation, styles.tableColHeader]}><Text>DESIGNATION</Text></View>
        <View style={[styles.colQuantite, styles.tableColHeader]}><Text>QTE</Text></View>
        <View style={[styles.colPUHT, styles.tableColHeader]}><Text>P.U.H.T</Text></View>
        <View style={[styles.colTVA, styles.tableColHeader]}><Text>TVA</Text></View>
        <View style={[styles.colPUTTC, styles.tableColHeader]}><Text>P.U.TTC</Text></View>
        <View style={[styles.colMontantTTC, styles.tableColHeader]}><Text>M.TTC</Text></View>
      </View>

      {articles.map((item, index) => {
        const qty = Number(item.quantite) || 0;
        const priceHT = Number(item.prixUnitaire) || 0;
        const tvaRate = Number(item.tva) || 0;
        const remiseRate = Number(item.remise) || 0;
        
        // Calculate exactly like bon commande
        const prixTTC = priceHT * (1 + tvaRate / 100);
        const montantSousTotalHT = Math.round(qty * priceHT * 1000) / 1000;
        const montantNetHT = Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
        const montantTTCLigne = Math.round(qty * prixTTC * 1000) / 1000;

        return (
          <View style={styles.tableRow} key={index}>
            <View style={[styles.colN, styles.tableCol]}><Text>{pageIndex * articlesPerPage + index + 1}</Text></View>
            <View style={[styles.colArticle, styles.tableCol]}>
              <Text>{item.article?.reference || '-'}</Text>
            </View>
            <View style={[styles.colDesignation, styles.tableCol]}>
              <Text>{item.article?.designation || '-'}</Text>
            </View>
            <View style={[styles.colQuantite, styles.tableCol]}><Text>{qty}</Text></View>
            <View style={[styles.colPUHT, styles.tableCol]}><Text>{formatCurrency(priceHT)}</Text></View>
            <View style={[styles.colTVA, styles.tableCol]}>
              <Text>{tvaRate > 0 ? `${tvaRate}%` : '-'}</Text>
            </View>
            <View style={[styles.colPUTTC, styles.tableCol]}><Text>{formatCurrency(prixTTC)}</Text></View>
            <View style={[styles.colMontantTTC, styles.tableCol]}><Text>{formatCurrency(montantTTCLigne)}</Text></View>
          </View>
        );
      })}
      
      {/* Empty state */}
      {articles.length === 0 && (
        <View style={styles.tableRow}>
          <View style={[styles.colDesignation, styles.tableCol, { width: '100%' }]}>
            <Text>Aucun article</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderTVABreakdown = () => {
    const tvaRates = Object.keys(tvaBreakdown).map(rate => parseFloat(rate)).sort((a, b) => a - b);
  
    if (tvaRates.length === 0) {
      // Show empty TVA table with 0 values when no TVA rates
      return (
        <View style={styles.tvaBreakdownContainer}>
          <View style={styles.tvaBreakdownTable}>
            <View style={styles.tvaBreakdownHeader}>
              <Text style={styles.tvaHeaderTaux}>Taux TVA</Text>
              <Text style={styles.tvaHeaderBase}>Base HT</Text>
              <Text style={styles.tvaHeaderMontant}>Montant TVA</Text>
            </View>
            <View style={styles.tvaBreakdownRow}>
              <Text style={styles.tvaColTaux}>-</Text>
              <Text style={styles.tvaColBase}>0,000 DT</Text>
              <Text style={styles.tvaColMontant}>0,000 DT</Text>
            </View>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.tvaBreakdownContainer}>
        <View style={styles.tvaBreakdownTable}>
          <View style={styles.tvaBreakdownHeader}>
            <Text style={styles.tvaHeaderTaux}>Taux TVA</Text>
            <Text style={styles.tvaHeaderBase}>Base HT</Text>
            <Text style={styles.tvaHeaderMontant}>Montant TVA</Text>
          </View>
         
          {tvaRates.map(rate => (
            <View style={styles.tvaBreakdownRow} key={rate}>
              <Text style={styles.tvaColTaux}>{rate}%</Text>
              <Text style={styles.tvaColBase}>{formatCurrency(tvaBreakdown[rate].base)} DT</Text>
              <Text style={styles.tvaColMontant}>
                {formatCurrency(tvaBreakdown[rate].montant)} DT
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
              <Text style={styles.summaryLabel}>Sous-total H.T.:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(sousTotalHT)} DT</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net H.T.:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(netHT)} DT</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TVA:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalTax)} DT</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total TTC:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(grandTotal)} DT</Text>
            </View>

            {Number(bonCommande.remise) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {bonCommande.remiseType === "percentage" ? `Remise (${bonCommande.remise}%)` : "Remise (Montant fixe)"}:
                </Text>
                <Text style={styles.summaryValue}>- {formatCurrency(discountAmount)} DT</Text>
              </View>
            )}

            <View style={styles.netAPayerContainer}>
              <Text style={styles.netAPayerLabel}>NET À PAYER:</Text>
              <Text style={styles.netAPayerValue}>{formatCurrency(finalTotal)} DT</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const safeBonCommande = bonCommande || {};
  const safeCompanyInfo = companyInfo || {};

  const renderPageHeader = (pageIndex: number) => (
    <>
      {/* Show continuation header for pages after the first */}
      {pageIndex > 0 && (
        <View style={styles.continuationHeader}>
          <Text>Suite de la Facture de Vente - Page {pageIndex + 1}</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          {safeCompanyInfo.logo && <Image src={safeCompanyInfo.logo} style={styles.logo} />}
        </View>
      </View>
      
      {/* Only show full header details on first page */}
      {pageIndex === 0 && (
        <>
          <View style={styles.commandeDetails}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <View style={styles.commandeDetailItem}>
                  <Text style={styles.commandeDetailLabel}>
                    N°: <Text style={styles.boldText}>{safeBonCommande.numeroCommande || 'N/A'}</Text>
                  </Text>
                </View>
                <View style={styles.commandeDetailItem}>
                  <Text style={styles.commandeDetailLabel}>
                    Date: <Text style={styles.boldText}>
                      {safeBonCommande.dateCommande ? moment(safeBonCommande.dateCommande).format("DD/MM/YYYY") : 'N/A'}
                    </Text>
                  </Text>
                </View>
              </View>
              
              <View style={styles.clientInfoContainer}>
                <Text style={styles.sectionTitle}>CLIENT</Text>
                {safeBonCommande.clientWebsite ? (
                  <>
                    {safeBonCommande.clientWebsite.nomPrenom &&
                      wrapText(safeBonCommande.clientWebsite.nomPrenom).map((line, index) => (
                        <Text style={styles.clientLine} key={`nomPrenom-${index}`}>{line}</Text>
                      ))
                    }
                    {safeBonCommande.clientWebsite.telephone && (
                      <Text style={styles.clientLine}>Tél: {safeBonCommande.clientWebsite.telephone}</Text>
                    )}
                    {safeBonCommande.clientWebsite.email && (
                      <Text style={styles.clientLine}>Email: {safeBonCommande.clientWebsite.email}</Text>
                    )}
                  </>
                ) : safeBonCommande.client ? (
                  <>
                    {safeBonCommande.client.raison_sociale &&
                      wrapText(safeBonCommande.client.raison_sociale).map((line, index) => (
                        <Text style={styles.clientLine} key={`raison-${index}`}>{line}</Text>
                      ))
                    }
                    {safeBonCommande.client.matricule_fiscal && (
                      <Text style={styles.clientLine}>MF: {safeBonCommande.client.matricule_fiscal}</Text>
                    )}
                    {safeBonCommande.client.adresse &&
                      wrapText(safeBonCommande.client.adresse).map((line, index) => (
                        <Text style={styles.clientLine} key={`adresse-${index}`}>{line}</Text>
                      ))
                    }
                    {safeBonCommande.client.telephone1 && (
                      <Text style={styles.clientLine}>Tél: {safeBonCommande.client.telephone1}</Text>
                    )}
                  </>
                ) : null}
              </View>
            </View>
          </View>
          
          <View style={styles.clientVendeurSection}>
            <View style={styles.vendeurInfo}>
              <Text style={styles.sectionTitle}>VENDEUR</Text>
              {safeBonCommande.vendeur && (
                <Text style={styles.vendeurText}>
                  {[safeBonCommande.vendeur.nom, safeBonCommande.vendeur.prenom].filter(Boolean).join(' ')}
                </Text>
              )}
            </View>
          </View>
        </>
      )}
    </>
  );

  return (
    <Document>
      {articleChunks.map((articles, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {renderPageHeader(pageIndex)}
          {renderTable(articles, pageIndex)}
          
          {/* Summary, amount in words, signatures only on last page */}
          {pageIndex === articleChunks.length - 1 && (
            <>
              {renderSummarySection()}
              
              <View style={styles.amountInWords}>
                <Text style={styles.amountText}>
                  Arrêtée la présente facture à la somme de : {amountInWords}
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
          )}
          
          <View style={styles.footer}>
            <Text style={styles.footerLine}>
              {[safeCompanyInfo.name, safeCompanyInfo.address, safeCompanyInfo.city, safeCompanyInfo.phone , safeCompanyInfo.gsm , safeCompanyInfo.taxId]
                .filter(Boolean)
                .join(' - ')}
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
          
          <Text style={styles.pageNumber}>
            Page {pageIndex + 1} sur {articleChunks.length}
          </Text>
        </Page>
      ))}
    </Document>
  );
};

export default FactureVentePDF;