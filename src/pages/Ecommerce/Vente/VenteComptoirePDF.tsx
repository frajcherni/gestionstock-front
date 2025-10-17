import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import moment from 'moment';
import { BonCommandeClient } from '../../../Components/Article/Interfaces';

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12 },
    header: { marginBottom: 20 },
    title: { fontSize: 18, marginBottom: 10 },
    table: { width: '100%', marginBottom: 20 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
    tableCell: { margin: 5, padding: 5, borderWidth: 1, borderColor: '#000' },
    bold: { fontWeight: 'bold' }
});

interface VenteComptoirePDFProps {
    bonCommande: BonCommandeClient;
    companyInfo: { name: string; address: string; city: string; phone: string; email: string; website: string; taxId: string };
}

const VenteComptoirePDF: React.FC<VenteComptoirePDFProps> = ({ bonCommande, companyInfo }) => {
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
                grandTotal: acc.grandTotal + montantTTCLigne
            };
        },
        { subTotal: 0, totalTax: 0, grandTotal: 0 }
    );

    let finalTotal = grandTotal;
    if (bonCommande.remise && Number(bonCommande.remise) > 0) {
        if (bonCommande.remiseType === "percentage") {
            finalTotal = grandTotal * (1 - Number(bonCommande.remise) / 100);
        } else {
            finalTotal = Number(bonCommande.remise);
        }
    }

    return (
        <Document>
            <Page style={styles.page}>
                <View style={styles.header}>
                    <Text>{companyInfo.name}</Text>
                    <Text>{companyInfo.address}, {companyInfo.city}</Text>
                    <Text>Téléphone: {companyInfo.phone}</Text>
                    <Text>Email: {companyInfo.email}</Text>
                    <Text>Matricule Fiscal: {companyInfo.taxId}</Text>
                </View>
                <Text style={styles.title}>Facture Vente Comptoire #{bonCommande.numeroCommande}</Text>
                <View>
                    <Text>Client: {bonCommande.client?.raison_sociale || 'N/A'}</Text>
                    <Text>Adresse: {bonCommande.client?.adresse || 'N/A'}</Text>
                    <Text>Téléphone: {bonCommande.client?.telephone1 || 'N/A'}</Text>
                    <Text>Date: {moment(bonCommande.dateCommande).format("DD MMM YYYY")}</Text>
                    <Text>Statut: {bonCommande.status}</Text>
                </View>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.bold]}>
                        <Text style={[styles.tableCell, { width: '30%' }]}>Article</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Réf.</Text>
                        <Text style={[styles.tableCell, { width: '10%' }]}>Qté</Text>
                        <Text style={[styles.tableCell, { width: '15%' }]}>Prix U.</Text>
                        <Text style={[styles.tableCell, { width: '10%' }]}>TVA</Text>
                        <Text style={[styles.tableCell, { width: '10%' }]}>Remise</Text>
                        <Text style={[styles.tableCell, { width: '10%' }]}>Total</Text>
                    </View>
                    {bonCommande.articles.map((item, index) => {
                        const totalHT = Number(item.quantite) * Number(item.prixUnitaire);
                        const discount = item.remise ? totalHT * (Number(item.remise) / 100) : 0;
                        const taxable = totalHT - discount;
                        const tax = item.tva ? taxable * (Number(item.tva) / 100) : 0;
                        const totalTTC = taxable + tax;

                        return (
                            <View style={styles.tableRow} key={index}>
                                <Text style={[styles.tableCell, { width: '30%' }]}>{item.article?.nom || item.article?.designation || 'N/A'}</Text>
                                <Text style={[styles.tableCell, { width: '15%' }]}>{item.article?.reference || '-'}</Text>
                                <Text style={[styles.tableCell, { width: '10%' }]}>{item.quantite}</Text>
                                <Text style={[styles.tableCell, { width: '15%' }]}>{Number(item.prixUnitaire).toFixed(2)} DT</Text>
                                <Text style={[styles.tableCell, { width: '10%' }]}>{item.tva || 0}%</Text>
                                <Text style={[styles.tableCell, { width: '10%' }]}>{item.remise || 0}%</Text>
                                <Text style={[styles.tableCell, { width: '10%' }]}>{totalTTC.toFixed(2)} DT</Text>
                            </View>
                        );
                    })}
                </View>
                <View>
                    <Text>Sous-total HT: {subTotal.toFixed(2)} DT</Text>
                    <Text>TVA: {totalTax.toFixed(2)} DT</Text>
                    <Text>Total TTC: {(subTotal + totalTax).toFixed(2)} DT</Text>
                    {bonCommande.remise && bonCommande.remise > 0 && (
                        <>
                            <Text>
                                {bonCommande.remiseType === "percentage"
                                    ? `Remise (${bonCommande.remise}%)`
                                    : "Remise (Montant fixe)"}
                                : {bonCommande.remiseType === "percentage"
                                    ? ((subTotal + totalTax) * (Number(bonCommande.remise) / 100)).toFixed(2)
                                    : Number(bonCommande.remise).toFixed(2)} DT
                            </Text>
                            <Text>Total Après Remise: {finalTotal.toFixed(2)} DT</Text>
                        </>
                    )}
                </View>
            </Page>
        </Document>
    );
};

export default VenteComptoirePDF;