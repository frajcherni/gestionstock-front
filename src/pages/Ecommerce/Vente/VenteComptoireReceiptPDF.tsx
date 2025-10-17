import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import moment from 'moment';
import { BonCommandeClient } from '../../../Components/Article/Interfaces';

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
    width: '80mm', // Optimized for 80mm thermal printers
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 8,
    marginBottom: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableCell: {
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  tableCellLast: {
    padding: 3,
  },
  bold: {
    fontWeight: 'bold',
  },
  totals: {
    marginTop: 10,
    textAlign: 'right',
  },
  footer: {
    textAlign: 'center',
    fontSize: 8,
    marginTop: 10,
  },
});

interface VenteComptoireReceiptPDFProps {
  bonCommande: BonCommandeClient;
  companyInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
  };
}

const VenteComptoireReceiptPDF: React.FC<VenteComptoireReceiptPDFProps> = ({ bonCommande, companyInfo }) => {
  const { subTotal, totalTax, grandTotal } = bonCommande.articles.reduce(
    (acc, item) => {
      const qty = Number(item.quantite) || 1;
      const price = Number(item.prixUnitaire) || 0;
      const tvaRate = Number(item.tva ?? 0);
      const remiseRate = Number(item.remise || 0);

      const montantHTLigne = qty * price * (1 - remiseRate / 100);
      const montantTTCLigne = montantHTLigne * (1 + tvaRate / 100);
      const taxAmount = montantTTCLigne - montantHTLigne;

      return {
        subTotal: acc.subTotal + montantHTLigne,
        totalTax: acc.totalTax + taxAmount,
        grandTotal: acc.grandTotal + montantTTCLigne,
      };
    },
    { subTotal: 0, totalTax: 0, grandTotal: 0 }
  );

  let finalTotal = grandTotal;
  if (bonCommande.remise && Number(bonCommande.remise) > 0) {
    if (bonCommande.remiseType === 'percentage') {
      finalTotal = grandTotal * (1 - Number(bonCommande.remise) / 100);
    } else {
      finalTotal = Number(bonCommande.remise);
    }
  }

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{companyInfo.name}</Text>
          <Text style={styles.companyInfo}>{companyInfo.address}, {companyInfo.city}</Text>
          <Text style={styles.companyInfo}>Tél: {companyInfo.phone}</Text>
          <Text style={styles.companyInfo}>MF: {companyInfo.taxId}</Text>
        </View>
        <Text style={styles.title}>Reçu #{bonCommande.numeroCommande}</Text>
        <Text>Date: {moment(bonCommande.dateCommande).format('DD MMM YYYY')}</Text>
        {bonCommande.client?.raison_sociale && (
          <Text>Client: {bonCommande.client.raison_sociale}</Text>
        )}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.bold]}>
            <Text style={[styles.tableCell, { width: '40%' }]}>Article</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>Qté</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>Prix</Text>
            <Text style={[styles.tableCellLast, { width: '20%' }]}>Total</Text>
          </View>
          {bonCommande.articles.map((item, index) => {
            const totalHT = Number(item.quantite) * Number(item.prixUnitaire);
            const discount = item.remise ? totalHT * (Number(item.remise) / 100) : 0;
            const taxable = totalHT - discount;
            const tax = item.tva ? taxable * (Number(item.tva) / 100) : 0;
            const totalTTC = taxable + tax;

            return (
              <View style={styles.tableRow} key={index}>
                <Text style={[styles.tableCell, { width: '40%' }]}>
                  {item.article?.nom || item.article?.designation || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{item.quantite}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{Number(item.prixUnitaire).toFixed(2)}</Text>
                <Text style={[styles.tableCellLast, { width: '20%' }]}>{totalTTC.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.totals}>
          <Text>Sous-total HT: {subTotal.toFixed(2)} DT</Text>
          <Text>TVA: {totalTax.toFixed(2)} DT</Text>
          <Text>Total TTC: {(subTotal + totalTax).toFixed(2)} DT</Text>
          {bonCommande.remise && bonCommande.remise > 0 && (
            <>
              <Text>
                {bonCommande.remiseType === 'percentage'
                  ? `Remise (${bonCommande.remise}%)`
                  : 'Remise (Montant fixe)'}
                : {bonCommande.remiseType === 'percentage'
                  ? ((subTotal + totalTax) * (Number(bonCommande.remise) / 100)).toFixed(2)
                  : Number(bonCommande.remise).toFixed(2)} DT
              </Text>
              <Text style={styles.bold}>Total Après Remise: {finalTotal.toFixed(2)} DT</Text>
            </>
          )}
        </View>
        <Text style={styles.footer}>Merci pour votre achat!</Text>
      </Page>
    </Document>
  );
};

export default VenteComptoireReceiptPDF;