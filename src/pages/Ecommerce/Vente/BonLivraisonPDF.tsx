// src/Components/CommandeClient/BonLivraisonPDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import moment from "moment";
import { BonLivraison } from "../../../Components/Article/Interfaces";

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
    padding: 30,
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottom: '1pt solid #000',
    paddingBottom: 10,
  },
  companyInfo: {
    width: '60%'
  },
  livraisonInfo: {
    width: '35%',
    alignItems: 'flex-end'
  },
  logo: {
    width: 200,
    marginBottom: 10
  },
  livraisonNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  livraisonDate: {
    fontSize: 12
  },
  clientVendeurSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  vendeurInfo: {
    width: '35%',
    alignItems: 'flex-start'
  },
  clientInfo: {
    width: '60%',
    alignItems: 'flex-end'
  },
  sectionTitle: {
    fontSize: 11,
    marginBottom: 8,
  },
  clientText: {
    fontSize: 9,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  vendeurText: {
    fontSize: 9,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  tableContainer: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#00aeef',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #eee',
    paddingVertical: 6,
    minHeight: 25,
  },
  tableColHeader: {
    paddingHorizontal: 4,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#ffffff'
  },
  tableCol: {
    paddingHorizontal: 4,
    fontSize: 9,
    textAlign: 'center'
  },
  colN: {
    width: '5%'
  },
  colArticle: {
    width: '15%',
    textAlign: 'left'
  },
  colDesignation: {
    width: '40%',
    textAlign: 'left'
  },
  colQteC: {
    width: '8%'
  },
  colTotalLiv: {
    width: '8%'
  },
  colQteLiv: {
    width: '8%'
  },
  colReste: {
    width: '8%'
  },
  colPUHT: {
    width: '10%',
    textAlign: 'right'
  },
  colTVA: {
    width: '8%'
  },
  colPUTTC: {
    width: '10%',
    textAlign: 'right'
  },
  colMontantTTC: {
    width: '10%',
    textAlign: 'right'
  },
  summarySection: {
    marginTop: 10,
  },
  totalsContainer: {
    width: '40%',
    marginLeft: 'auto',
  },
  totalsBox: {
    padding: 15,
    border: '1pt solid #ddd',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  summaryLabel: {
    fontSize: 10,
  },
  summaryValue: {
    fontSize: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1pt solid #ccc'
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2pt solid #333'
  },
  cachetSignatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 135,
    left: 30,
    right: 30,
  },
  signatureContainer: {
    width: '45%',
    alignItems: 'flex-start',
  },
  cachetContainer: {
    width: '45%',
    alignItems: 'flex-end',
  },
  signatureText: {
    fontSize: 10,
    marginBottom: 5
  },
  cachetText: {
    fontSize: 10,
    marginBottom: 5
  },
  subText: {
    fontSize: 8,
    fontStyle: 'italic'
  },
  footer: {
    position: 'absolute',
    bottom: 5,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    borderTop: '1pt solid #000',
    paddingTop: 5
  },
  footerLine: {
    marginBottom: 2
  },
  amountInWords: {
    position: 'absolute',
    bottom: 45,
    left: 30,
    right: 30,
    padding: 10,
    border: '1pt solid #000',
  },
  amountText: {
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  livraisonDetails: {
    marginBottom: 20,
  },
  livraisonDetailItem: {
    marginBottom: 5,
  },
  livraisonDetailLabel: {
    fontSize: 12,
  },
  livraisonDetailValue: {
    fontSize: 12,
  }
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
  };
}

const BonLivraisonPDF: React.FC<BonLivraisonPDFProps> = ({ bonLivraison, companyInfo }) => {
  // Check if BL is linked to a BC
  const isLinkedToBC = !!bonLivraison.bonCommandeClient;

  // Calculate totals exactly like in BonCommandeClientList useMemo
  const calculateTotals = () => {
    if (bonLivraison.articles.length === 0) {
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
    bonLivraison.articles.forEach((article) => {
      const qty = Number(article.quantite) || 0;
      const tvaRate = Number(article.tva) || 0;
      const remiseRate = Number(article.remise) || 0;
      
      const priceHT = Number(article.prix_unitaire) || 0;
      const priceTTC =Number(article.prix_ttc) || priceHT * (1 + tvaRate / 100);

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
    const remiseValue = Number(bonLivraison.remise) || 0;
    const remiseTypeValue = bonLivraison.remiseType || "percentage";

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
    };
  };

  const { sousTotalHT, netHT, totalTax, grandTotal, finalTotal, discountAmount } = calculateTotals();

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toFixed(3);
  };

  // Number to words conversion (same as BC)
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Same as BC */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {companyInfo.logo && (
              <Image src={companyInfo.logo} style={styles.logo} />
            )}
          </View>    
        </View>

        {/* Livraison Details Block - Same layout as BC */}
        <View style={styles.livraisonDetails}>
          <View style={styles.livraisonDetailItem}>
            <Text style={styles.livraisonDetailLabel}>
              N°: <Text style={{ fontWeight: 'bold' }}>{bonLivraison.numeroLivraison}</Text>
            </Text>
          </View>
          <View style={styles.livraisonDetailItem}>
            <Text style={styles.livraisonDetailLabel}>
              Date: <Text style={{ fontWeight: 'bold' }}>{moment(bonLivraison.dateLivraison).format("DD/MM/YYYY")}</Text>
            </Text>
          </View>
          {isLinkedToBC && (
            <View style={styles.livraisonDetailItem}>
              <Text style={styles.livraisonDetailLabel}>
                Commande: <Text style={{ fontWeight: 'bold' }}>{bonLivraison.bonCommandeClient?.numeroCommande}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Client and Vendeur - Same alignment as BC */}
        <View style={styles.clientVendeurSection}>
          <View style={styles.vendeurInfo}>
            <Text style={styles.sectionTitle}>VENDEUR</Text>
            {bonLivraison.vendeur && (
              <Text style={styles.vendeurText}>
                <Text style={{ fontWeight: 'bold' }}>
                  {[bonLivraison.vendeur.nom, bonLivraison.vendeur.prenom].filter(Boolean).join(' ')}
                </Text>
              </Text>
            )}
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.sectionTitle}>CLIENT</Text>
            {bonLivraison.client ? (
              <>
                {bonLivraison.client.raison_sociale && (
                  <Text style={styles.clientText}>
                    <Text style={{ fontWeight: 'bold' }}>{bonLivraison.client.raison_sociale}</Text>
                  </Text>
                )}
                {bonLivraison.client.matricule_fiscal && (
                  <Text style={styles.clientText}>
                    MF: <Text style={{ fontWeight: 'bold' }}>{bonLivraison.client.matricule_fiscal}</Text>
                  </Text>
                )}
                {bonLivraison.client.telephone1 && (
                  <Text style={styles.clientText}>
                    Tél: <Text style={{ fontWeight: 'bold' }}>{bonLivraison.client.telephone1}</Text>
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.clientText}>Client non spécifié</Text>
            )}
          </View>
        </View>

        {/* Articles Table - Same styling as BC */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={[styles.colN, styles.tableColHeader]}><Text>N°</Text></View>
            <View style={[styles.colArticle, styles.tableColHeader]}><Text>ARTICLE</Text></View>
            <View style={[styles.colDesignation, styles.tableColHeader]}><Text>DESIGNATION</Text></View>
      
            <View style={[styles.colQteLiv, styles.tableColHeader]}><Text>QTE </Text></View>
          
            <View style={[styles.colPUHT, styles.tableColHeader]}><Text>P.U.H.T</Text></View>
            <View style={[styles.colTVA, styles.tableColHeader]}><Text>TVA</Text></View>
            <View style={[styles.colPUTTC, styles.tableColHeader]}><Text>P.U.TTC</Text></View>
            <View style={[styles.colMontantTTC, styles.tableColHeader]}><Text>M.TTC</Text></View>
          </View>

          {bonLivraison.articles.map((item, index) => {
            // Current BL delivered quantity
            const qteLiv = Number(item.quantite) || 0;
            
            // BC quantities if linked
            let qteC = 0;
            let totalLiv = 0;
            let reste = 0;
            
            if (isLinkedToBC && bonLivraison.bonCommandeClient?.articles) {
              const bcArticle = bonLivraison.bonCommandeClient.articles.find(
                (bcArt: any) => bcArt.article_id === item.article_id || bcArt.article?.id === item.article?.id
              );
              if (bcArticle) {
                qteC = Number(bcArticle.quantite) || 0;
                totalLiv = Number(bcArticle.quantiteLivree) || 0;
                reste = Math.max(0, qteC - totalLiv);
              }
            }
            
            const priceHT = Number(item.prix_unitaire) || 0;
            const tvaRate = Number(item.tva) || 0;
            const prixTTC = Number(item.prix_ttc)  || priceHT * (1 + tvaRate / 100);
            const montantTTC = qteLiv * prixTTC;

            return (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.colN, styles.tableCol]}><Text>{index + 1}</Text></View>
                <View style={[styles.colArticle, styles.tableCol]}>
                  <Text>{item.article?.reference || '-'}</Text>
                </View>
                <View style={[styles.colDesignation, styles.tableCol]}>
                  <Text>{item.article?.designation || ''}</Text>
                </View>
             
                <View style={[styles.colQteLiv, styles.tableCol]}><Text>{qteLiv}</Text></View>
               
                <View style={[styles.colPUHT, styles.tableCol]}><Text>{formatCurrency(priceHT)}</Text></View>
                <View style={[styles.colTVA, styles.tableCol]}>
                  <Text>{tvaRate > 0 ? `${tvaRate}%` : ''}</Text>
                </View>
                <View style={[styles.colPUTTC, styles.tableCol]}><Text>{formatCurrency(prixTTC)}</Text></View>
                <View style={[styles.colMontantTTC, styles.tableCol]}><Text>{formatCurrency(montantTTC)}</Text></View>
              </View>
            );
          })}
        </View>

        {/* Totals Section - Same as BC */}
        <View style={styles.summarySection}>
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

              {Number(bonLivraison.remise) > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {bonLivraison.remiseType === "percentage" ? `Remise (${bonLivraison.remise}%)` : "Remise (Montant fixe)"}:
                  </Text>
                  <Text style={styles.summaryValue}>- {formatCurrency(discountAmount)} DT</Text>
                </View>
              )}

              <View style={styles.finalTotalRow}>
                <Text style={styles.summaryLabel}>NET À PAYER:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(finalTotal)} DT</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Amount in Words - Same as BC */}
        <View style={styles.amountInWords}>
          <Text style={styles.amountText}>
            Arrêtée le présent bon de livraison à la somme de : {amountInWords}
          </Text>
        </View>

        {/* Cachet & Signature - Same positioning and styling as BC */}
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

        {/* Footer - Same as BC */}
        <View style={styles.footer}>
          <Text style={styles.footerLine}>
            {[companyInfo.name, companyInfo.address, companyInfo.city, companyInfo.phone]
              .filter(Boolean)
              .join(' - ')}
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
      </Page>
    </Document>
  );
};

export default BonLivraisonPDF;