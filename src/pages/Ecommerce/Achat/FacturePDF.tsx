// src/Components/Article/FacturePDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, PDFViewer, Font, Image } from '@react-pdf/renderer';
import moment from "moment";
import { FactureFournisseur } from "../../../Components/Article/Interfaces";

// Enregistrer les polices
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// Créer les styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  companyInfo: {
    width: '50%'
  },
  invoiceInfo: {
    width: '40%',
    alignItems: 'flex-end'
  },
  logo: {
    width: 220,
    height: 80,
    marginBottom: 10
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5
  },
  label: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2
  },
  value: {
    fontSize: 9,
    color: '#333',
    marginBottom: 3
  },
  // Simple fournisseur section as text
  fournisseurSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5'
  },
  fournisseurTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  fournisseurText: {
    fontSize: 9,
    color: '#333',
    marginBottom: 2
  },
  // Table styles
  tableContainer: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2d3748',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingVertical: 6,
  },
  tableColHeader: {
    paddingHorizontal: 6,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#ffffff'
  },
  tableCol: {
    paddingHorizontal: 6,
    textAlign: 'center',
    fontSize: 8,
    color: '#333'
  },
  // Column widths
  colArticle: {
    width: '30%',
    textAlign: 'left'
  },
  colReference: {
    width: '10%'
  },
  colQuantite: {
    width: '8%'
  },
  colPrix: {
    width: '12%'
  },
  colTVA: {
    width: '8%'
  },
  colRemise: {
    width: '8%'
  },
  colTotalHT: {
    width: '12%'
  },
  colTotalTTC: {
    width: '12%'
  },
  // Summary section
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsContainer: {
    width: '40%'
  },
  totalsBox: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e5e5'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  summaryLabel: {
    fontSize: 9,
    color: '#333'
  },
  summaryValue: {
    fontSize: 9,
    color: '#333'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    fontWeight: 'bold'
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 8
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666'
  },

  cachetSignatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 80, // Position above footer
    left: 30,
    right: 30,
  },
  cachetContainer: {
    width: '45%',
    alignItems: 'flex-start',
  },
  signatureContainer: {
    width: '45%',
    alignItems: 'flex-end',
  },
  cachetBox: {
    padding: 15,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'solid',
    minHeight: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  signatureBox: {
    padding: 15,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'solid',
    minHeight: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  cachetText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  signatureText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subText: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

});

// Composant PDF
interface FacturePDFProps {
  facture: FactureFournisseur;
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

const FacturePDF: React.FC<FacturePDFProps> = ({ facture, companyInfo }) => {
  // Calculer les totaux selon la même logique que FactureList
  let subTotalValue = 0;
  let totalTaxValue = 0;
  let grandTotalValue = 0;

  facture.articles.forEach(item => {
    const qty = Number(item.quantite) || 1;
    const price = Number(item.prixUnitaire) || 0;
    const tvaRate = Number(item.tva ?? 0);
    const remiseRate = Number(item.remise || 0);

    const montantHTLigne = qty * price * (1 - (remiseRate / 100));
    const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));
    const taxAmount = montantTTCLigne - montantHTLigne;

    subTotalValue += montantHTLigne;
    totalTaxValue += taxAmount;
    grandTotalValue += montantTTCLigne;
  });

  const remiseValue = Number(facture.remise) || 0;
  const remiseTypeValue = facture.remiseType || "percentage";
  const timbreFiscal = facture.timbreFiscal || false;
  
  let finalTotal = grandTotalValue;
  let displayTotalTTC = grandTotalValue;

  // Apply discount if any
  if (remiseValue > 0) {
    if (remiseTypeValue === "percentage") {
      finalTotal = grandTotalValue * (1 - (remiseValue / 100));
    } else {
      finalTotal = Number(remiseValue);
    }
  }

  // Add timbre fiscal to the appropriate total
  if (timbreFiscal) {
    if (remiseValue > 0) {
      // If there's a discount, add timbre to final total (after discount)
      finalTotal += 1;
    } else {
      // If no discount, add timbre to displayTotalTTC (Total TTC line)
      displayTotalTTC += 1;
      finalTotal = displayTotalTTC; // Final total is the same as Total TTC
    }
  }

  const discountAmount = remiseValue > 0 ? (remiseTypeValue === "percentage" 
    ? grandTotalValue * (remiseValue / 100) 
    : grandTotalValue - Number(remiseValue)) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {companyInfo.logo && (
              <Image src={companyInfo.logo} style={styles.logo} />
            )}
            <Text style={styles.value}>{companyInfo.name}</Text>
            <Text style={styles.value}>{companyInfo.address}, {companyInfo.city}</Text>
            <Text style={styles.value}>Tél: {companyInfo.phone} | MF: {companyInfo.taxId}</Text>
          </View>
          
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceNumber}>{facture.numeroFacture}</Text>
            
            <Text style={styles.label}>DATE</Text>
            <Text style={styles.value}>{moment(facture.dateFacture).format("DD/MM/YYYY")}</Text>
            
            {facture.dateEcheance && (
              <>
                <Text style={styles.label}>ÉCHÉANCE</Text>
                <Text style={styles.value}>{moment(facture.dateEcheance).format("DD/MM/YYYY")}</Text>
              </>
            )}
          </View>
        </View>

        {/* Informations du fournisseur - Simple text */}
        <View style={styles.fournisseurSection}>
          <Text style={styles.fournisseurTitle}>Fournisseur: {facture.fournisseur?.raison_sociale || 'Non spécifié'}</Text>
          <Text style={styles.fournisseurText}>Adresse: {facture.fournisseur?.adresse || 'Non spécifié'}</Text>
          <Text style={styles.fournisseurText}>Matricule Fiscal: {facture.fournisseur?.matricule_fiscal || 'Non spécifié'}</Text>
          <Text style={styles.fournisseurText}>Téléphone: {facture.fournisseur?.telephone1 || 'Non spécifié'}</Text>
        </View>

        {/* Tableau des articles */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={[styles.colArticle, styles.tableColHeader]}>
              <Text>ARTICLE</Text>
            </View>
            <View style={[styles.colReference, styles.tableColHeader]}>
              <Text>RÉF.</Text>
            </View>
            <View style={[styles.colQuantite, styles.tableColHeader]}>
              <Text>QTÉ</Text>
            </View>
            <View style={[styles.colPrix, styles.tableColHeader]}>
              <Text>PRIX UNIT.</Text>
            </View>
            <View style={[styles.colTVA, styles.tableColHeader]}>
              <Text>TVA %</Text>
            </View>
            <View style={[styles.colRemise, styles.tableColHeader]}>
              <Text>REMISE %</Text>
            </View>
            <View style={[styles.colTotalHT, styles.tableColHeader]}>
              <Text>TOTAL HT</Text>
            </View>
            <View style={[styles.colTotalTTC, styles.tableColHeader]}>
              <Text>TOTAL TTC</Text>
            </View>
          </View>

          {facture.articles.map((item, index) => {
            const qty = Number(item.quantite) || 1;
            const price = Number(item.prixUnitaire) || 0;
            const tvaRate = Number(item.tva ?? 0);
            const remiseRate = Number(item.remise || 0);

            const montantHTLigne = qty * price * (1 - (remiseRate / 100));
            const montantTTCLigne = montantHTLigne * (1 + (tvaRate / 100));

            return (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.colArticle, styles.tableCol]}>
                  <Text>{item.article?.designation}</Text>
                </View>
                <View style={[styles.colReference, styles.tableCol]}>
                  <Text>{item.article?.reference || '-'}</Text>
                </View>
                <View style={[styles.colQuantite, styles.tableCol]}>
                  <Text>{qty}</Text>
                </View>
                <View style={[styles.colPrix, styles.tableCol]}>
                  <Text>{price.toFixed(2)}</Text>
                </View>
                <View style={[styles.colTVA, styles.tableCol]}>
                  <Text>{tvaRate.toFixed(0)}%</Text>
                </View>
                <View style={[styles.colRemise, styles.tableCol]}>
                  <Text>{remiseRate.toFixed(0)}%</Text>
                </View>
                <View style={[styles.colTotalHT, styles.tableCol]}>
                  <Text>{montantHTLigne.toFixed(2)}</Text>
                </View>
                <View style={[styles.colTotalTTC, styles.tableCol]}>
                  <Text>{montantTTCLigne.toFixed(2)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Résumé et totaux */}
        <View style={styles.summarySection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalsBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sous-total HT:</Text>
                <Text style={styles.summaryValue}>{subTotalValue.toFixed(3)} DT</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>TVA:</Text>
                <Text style={styles.summaryValue}>{totalTaxValue.toFixed(3)} DT</Text>
              </View>
              
              {/* Show timbre fiscal in Total TTC line ONLY if no discount */}
              {timbreFiscal && remiseValue === 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Timbre Fiscal:</Text>
                  <Text style={styles.summaryValue}>1.000 DT</Text>
                </View>
              )}
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total TTC:</Text>
                <Text style={styles.summaryValue}>{displayTotalTTC.toFixed(3)} DT</Text>
              </View>
              
              {remiseValue > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {remiseTypeValue === "percentage" ? `Remise (${remiseValue}%)` : "Remise"}:
                  </Text>
                  <Text style={styles.summaryValue}>- {discountAmount.toFixed(3)} DT</Text>
                </View>
              )}
              
              {/* Show timbre fiscal in final total calculation ONLY if there's a discount */}
              {timbreFiscal && remiseValue > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Timbre Fiscal:</Text>
                  <Text style={styles.summaryValue}>1.000 DT</Text>
                </View>
              )}
              
              {/* Only show "Total après remise" if there's actually a remise */}
              {remiseValue > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.summaryLabel}>
                    {timbreFiscal ? "Total après remise et timbre" : "Total après remise"}
                  </Text>
                  <Text style={styles.summaryValue}>{finalTotal.toFixed(3)} DT</Text>
                </View>
              )}
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Montant payé:</Text>
                <Text style={styles.summaryValue}>{Number(facture.montantPaye).toFixed(3)} DT</Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.summaryLabel}>Reste à payer:</Text>
                <Text style={styles.summaryValue}>{Number(facture.resteAPayer).toFixed(3)} DT</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cachet et Signature */}
        <View style={styles.cachetSignatureSection}>
          <View style={styles.cachetContainer}>
            <View style={styles.cachetBox}>
              <Text style={styles.cachetText}>Cachet et Signature</Text>
              <Text style={styles.subText}>Du Fournisseur</Text>
            </View>
          </View>
          
          <View style={styles.signatureContainer}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureText}>Cachet et Signature</Text>
              <Text style={styles.subText}>Du Responsable</Text>
            </View>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>{companyInfo.name} - {companyInfo.address} - {companyInfo.city} - Tél: {companyInfo.phone}</Text>
        </View>

        {/* Numéro de page */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} sur ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default FacturePDF;