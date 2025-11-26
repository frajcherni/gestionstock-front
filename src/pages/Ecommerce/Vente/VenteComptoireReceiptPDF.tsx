import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import moment from 'moment';
import { BonCommandeClient } from '../../../Components/Article/Interfaces';

const styles = StyleSheet.create({
  page: {
    padding: 12, // Increased from 10
    fontSize: 11, // Increased from 8
    width: '90mm', // Increased from 80mm
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 6, // Increased
    borderBottom: '1pt solid #000',
    paddingBottom: 5, // Increased
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 4, // Increased
  },
  logo: {
    width: 130, // Increased from 120
    marginBottom: 3, // Increased
  },
  companyName: {
    fontSize: 13, // Increased from 10
    marginBottom: 2, // Increased
    color: '#2c3e50',
  },
  companyInfo: {
    fontSize: 7.5, // Increased from 6
    marginBottom: 2, // Increased
    color: '#666',
  },
  title: {
    fontSize: 12, // Increased from 9
    textAlign: 'center',
    marginBottom: 5, // Increased
    color: '#2c3e50',
    fontWeight: 'bold', // Added bold
  },
  receiptInfo: {
    marginBottom: 5, // Increased
    padding: 4, // Increased
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2, // Increased
  },
  infoLabel: {
    color: '#2c3e50',
    fontSize: 10, // Increased from 7
    fontWeight: 'bold', // Added bold
  },
  divider: {
    borderBottom: '1pt solid #000',
    marginVertical: 4, // Increased
  },
  table: {
    width: '100%',
    marginBottom: 5, // Increased
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '',
    padding: 4, // Increased
    borderBottom: '1pt solid #000',
  },
  tableHeaderText: {
    color: 'black',
    fontSize: 11, // Increased from 8
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #eee',
    paddingVertical: 3, // Increased
  },
  articleCell: {
    flex: 3,
    paddingHorizontal: 3, // Increased
  },
  qtyCell: {
    flex: 1,
    paddingHorizontal: 3, // Increased
    textAlign: 'center',
  },
  priceCell: {
    flex: 2,
    paddingHorizontal: 3, // Increased
    textAlign: 'right',
  },
  articleName: {
    fontSize: 9, // Increased from 6
    marginBottom: 2, // Increased
    fontWeight: 'bold', // Added bold
  },
  totalsSection: {
    marginTop: 6, // Increased
    padding: 5, // Increased
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3, // Increased
  },
  totalLabel: {
    fontSize: 10, // Increased from 7
    color: '#2c3e50',
    fontWeight: 'bold', // Added bold
  },
  totalValue: {
    fontSize: 10, // Increased from 7
    fontWeight: 'bold', // Added bold
  },
  discountRow: {
    color: '#e74c3c',
  },
  finalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4, // Increased
    paddingTop: 3, // Increased
    borderTop: '1pt solid #bdc3c7',
    fontSize: 11, // Increased from 8
    color: '#2c3e50',
    fontWeight: 'bold', // Added bold
  },
  paymentMethod: {
    marginTop: 4, // Increased
    padding: 3, // Increased
    border: '1pt dashed #ccc',
  },
  paymentText: {
    fontSize: 9, // Increased from 6
    textAlign: 'center',
    fontWeight: 'bold', // Added bold
  },
  thankYou: {
    textAlign: 'center',
    fontSize: 10, // Increased from 7
    marginTop: 5, // Increased
    color: '#27ae60',
    fontWeight: 'bold', // Added bold
  },
});

interface VenteComptoireReceiptPDFProps {
  bonCommande: BonCommandeClient;
  companyInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    gsm : string
    email: string;
    website: string;
    taxId: string;
    logo?: string;
  };
}

interface Totals {
  sousTotalHT: number;
  netHT: number;
  totalTax: number;
  grandTotal: number;
  finalTotal: number;
  discountAmount: number;
  globalRemise: number;
  remiseType: string;
}

const VenteComptoireReceiptPDF: React.FC<VenteComptoireReceiptPDFProps> = ({ 
  bonCommande, 
  companyInfo 
}) => {
  // Calculate totals exactly like in create/edit modal
  const calculateTotals = (): Totals => {
    if (!bonCommande.articles || bonCommande.articles.length === 0) {
      return {
        sousTotalHT: 0,
        netHT: 0,
        totalTax: 0,
        grandTotal: 0,
        finalTotal: 0,
        discountAmount: 0,
        globalRemise: 0,
        remiseType: "percentage",
      };
    }

    let sousTotalHTValue = 0;
    let netHTValue = 0;
    let totalTaxValue = 0;
    let grandTotalValue = 0;

    // Calculate initial totals with proper rounding (exactly like create/edit)
    bonCommande.articles.forEach((article) => {
      const qty = Number(article.quantite) || 0;
      const priceHT = Number(article.prixUnitaire) || 0;
      const tvaRate = Number(article.tva ?? 0);
      const remiseRate = Number(article.remise || 0);

      // Calculate line amounts with proper rounding
      const montantSousTotalHT = Math.round(qty * priceHT * 1000) / 1000;
      const montantNetHT = Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
      const montantTTCLigne = Math.round(montantNetHT * (1 + tvaRate / 100) * 1000) / 1000;
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

    // Apply remise logic with proper rounding (exactly like create/edit)
    const globalRemise = Number(bonCommande.remise) || 0;
    const remiseType = bonCommande.remiseType || "percentage";

    if (globalRemise > 0) {
      if (remiseType === "percentage") {
        discountAmountValue = Math.round(netHTValue * (globalRemise / 100) * 1000) / 1000;
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
    const displayNetHT = globalRemise > 0 ? netHTAfterDiscount : netHTValue;
    const displayTotalTax = globalRemise > 0 ? totalTaxAfterDiscount : totalTaxValue;

    return {
      sousTotalHT: Math.round(sousTotalHTValue * 1000) / 1000,
      netHT: Math.round(displayNetHT * 1000) / 1000,
      totalTax: Math.round(displayTotalTax * 1000) / 1000,
      grandTotal: Math.round(grandTotalValue * 1000) / 1000,
      finalTotal: Math.round(finalTotalValue * 1000) / 1000,
      discountAmount: Math.round(discountAmountValue * 1000) / 1000,
      globalRemise,
      remiseType,
    };
  };

  const totals = calculateTotals();

  return (
    <Document>
      <Page size={[255, 1000]} style={styles.page}> {/* Increased from 226 to 255 */}
        {/* Professional Header with Logo */}
        <View style={styles.header}>
          {companyInfo.logo && (
            <View style={styles.logoContainer}>
              <Image src={companyInfo.logo} style={styles.logo} />
            </View>
          )}
          <Text style={styles.companyInfo}>{companyInfo.address}</Text>
          <Text style={styles.companyInfo}>
            {companyInfo.city} - Tél: {companyInfo.phone }  - Gsm : {companyInfo.gsm } - MF {companyInfo.taxId } 
          </Text>
        </View>

        {/* Receipt Title */}
        <Text style={styles.title}>REÇU DE VENTE</Text>

        {/* Receipt Information */}
        <View style={styles.receiptInfo}>
          <View style={styles.infoRow}>
            <Text>
              <Text style={styles.infoLabel}>N°: </Text>
              {bonCommande.numeroCommande}
            </Text>
            <Text>
              <Text style={styles.infoLabel}>Date: </Text>
              {moment(bonCommande.dateCommande).format('DD/MM/YYYY')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text>
              <Text style={styles.infoLabel}>Vendeur: </Text>
              {bonCommande.vendeur?.prenom} {bonCommande.vendeur?.nom}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Professional Articles Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.articleCell]}>ARTICLE</Text>
            <Text style={[styles.tableHeaderText, styles.qtyCell]}>QTÉ</Text>
            <Text style={[styles.tableHeaderText, styles.priceCell]}>P.U TTC</Text>
            <Text style={[styles.tableHeaderText, styles.priceCell]}>TOTAL</Text>
          </View>

          {bonCommande.articles?.map((item, index) => {
            const article = item.article;
            const qty = Number(item.quantite) || 0;
            const priceHT = Number(item.prixUnitaire) || 0;
            const tvaRate = Number(item.tva ?? 0);
            const remiseRate = Number(item.remise || 0);
            
            // Calculate exactly like in create/edit modal
            const montantNetHT = Math.round(qty * priceHT * (1 - remiseRate / 100) * 1000) / 1000;
            const montantTTCLigne = Math.round(montantNetHT * (1 + tvaRate / 100) * 1000) / 1000;
            const priceTTC = priceHT * (1 + (tvaRate / 100));

            return (
              <View style={styles.tableRow} key={index}>
                <View style={styles.articleCell}>
                  <Text style={styles.articleName}>
                    {article?.designation || 'Article'}
                  </Text>
                </View>
                <Text style={styles.qtyCell}>{qty}</Text>
                <Text style={styles.priceCell}>{priceTTC.toFixed(3)}</Text>
                <Text style={styles.priceCell}>{montantTTCLigne.toFixed(3)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Professional Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total H.T.:</Text>
            <Text style={styles.totalValue}>{totals.sousTotalHT.toFixed(3)} DT</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Net H.T.:</Text>
            <Text style={styles.totalValue}>{totals.netHT.toFixed(3)} DT</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA:</Text>
            <Text style={styles.totalValue}>{totals.totalTax.toFixed(3)} DT</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total TTC:</Text>
            <Text style={styles.totalValue}>{totals.grandTotal.toFixed(3)} DT</Text>
          </View>
          
          {totals.globalRemise > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, styles.discountRow]}>
                {totals.remiseType === "percentage" 
                  ? `Remise (${totals.globalRemise}%)` 
                  : 'Remise'}
              </Text>
              <Text style={[styles.totalValue, styles.discountRow]}>
                - {totals.discountAmount.toFixed(3)} DT
              </Text>
            </View>
          )}
          
          <View style={styles.finalTotal}>
            <Text>NET À PAYER:</Text>
            <Text>{totals.finalTotal.toFixed(3)} DT</Text>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.paymentMethod}>
          <Text style={styles.paymentText}>*** ESPÈCES ***</Text>
        </View>

        {/* Thank You Message */}
        <View style={styles.thankYou}>
          <Text>MERCI POUR VOTRE CONFIANCE !</Text>
        </View>
      </Page>
    </Document>
  );
};

export default VenteComptoireReceiptPDF;