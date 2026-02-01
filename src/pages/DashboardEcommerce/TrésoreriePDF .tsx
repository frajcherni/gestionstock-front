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

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf" },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf", fontWeight: 300 },
  ],
});

const styles = StyleSheet.create({
  page: { 
    padding: 20, 
    fontFamily: "Roboto", 
    fontSize: 7, 
    backgroundColor: "#ffffff",
    lineHeight: 1.1
  },
  header: { 
    marginBottom: 12, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start",
    borderBottom: "0.5pt solid #000000",
    paddingBottom: 10
  },
  logo: { 
    width: 90, 
    height: 35, 
    objectFit: "contain",
    opacity: 0.9
  },
  companyInfo: { 
    fontSize: 7, 
    lineHeight: 1.2,
    textAlign: "right"
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 1,
    color: "#000000"
  },
  title: { 
    fontSize: 13, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 3, 
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 5
  },
  subtitle: {
    fontSize: 8,
    textAlign: "center",
    marginBottom: 12,
    color: "#666666",
    fontWeight: 300
  },
  period: { 
    textAlign: "center", 
    fontSize: 8, 
    color: "#333333", 
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 2,
    alignSelf: "center"
  },

  // Main table container
  tableContainer: { 
    width: "100%", 
    border: "0.5pt solid #000000",
    marginBottom: 3
  },
  
  // Group header
  groupHeader: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: "bold",
    color: "#000000",
    borderBottom: "0.5pt solid #000000",
    textTransform: "uppercase"
  },
  
  // Table header row
  tableHeader: { 
    flexDirection: "row",
    borderBottom: "0.5pt solid #000000",
    backgroundColor: "#f9f9f9",
    minHeight: 22
  },
  
  // Table rows
  row: { 
    flexDirection: "row", 
    borderBottom: "0.3pt solid #e0e0e0",
    minHeight: 20,
    alignItems: "stretch"
  },
  
  // Last row in each group
  lastRow: {
    borderBottom: "0.5pt solid #000000"
  },
  
  // Header cells
  headerCell: { 
    paddingVertical: 6,
    paddingHorizontal: 3,
    fontSize: 7,
    fontWeight: "bold",
    color: "#000000",
    borderRight: "0.3pt solid #000000",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  
  // Regular cells
  cell: { 
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontSize: 7,
    borderRight: "0.3pt solid #e0e0e0",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    overflow: "hidden"
  },
  
  // Last column cell (no right border)
  lastCell: { 
    borderRight: "none" 
  },
  
  // Column widths
  colDate: { width: "8%" },
  colNum: { width: "15%" },
  colClient: { width: "21%" },
  colMode: { width: "25%" },
  colAmount: { width: "11%", textAlign: "right" },
  colRefDate: { width: "10%", textAlign: "center" },
  colType: { width: "10%", textAlign: "center" },

  // Group total row
  groupTotalRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderTop: "0.3pt solid #000000",
    borderBottom: "0.5pt solid #000000",
    minHeight: 20,
    alignItems: "center",
    paddingVertical: 4
  },
  groupTotalLabel: {
    width: "69%",
    textAlign: "right",
    paddingRight: 8,
    fontSize: 7,
    fontWeight: "bold",
    color: "#000000",
    borderRight: "0.3pt solid #e0e0e0"
  },
  groupTotalValue: {
    width: "11%",
    textAlign: "right",
    paddingRight: 3,
    fontSize: 7,
    fontWeight: "bold",
    color: "#000000",
    borderRight: "0.3pt solid #e0e0e0"
  },
  groupTotalSpacer: {
    width: "20%",
    borderRight: "none"
  },

  // General total for recettes
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#000000",
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontWeight: "bold",
    marginTop: 8,
    borderRadius: 2,
    justifyContent: "space-between",
    alignItems: "center"
  },
  
  totalLabel: { 
    fontSize: 9,
    fontWeight: "bold"
  },
  totalValue: { 
    fontSize: 10,
    fontWeight: "bold"
  },

  // Footer
  footer: {
    marginTop: 15,
    fontSize: 6,
    color: "#666666",
    textAlign: "center",
    borderTop: "0.3pt solid #e0e0e0",
    paddingTop: 6,
    lineHeight: 1.2
  },
  
  pageNumber: { 
    position: "absolute", 
    bottom: 15, 
    left: 20, 
    fontSize: 7, 
    color: "#666666" 
  },
  
  // Utility classes
  bold: {
    fontWeight: "bold"
  },
  textRight: {
    textAlign: "right"
  },
  textCenter: {
    textAlign: "center"
  },
  textLeft: {
    textAlign: "left"
  },
  italic: {
    fontStyle: "italic"
  }
});

const TrésoreriePDF: React.FC<any> = ({ data, companyInfo, dateRange }) => {
  // Safe format amount function
  const formatAmount = (value: any) => {
    if (value === null || value === undefined) return "0.000";
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return "0.000";
    return num.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get all transactions from data
  const allTransactions = data?.transactions || [];

  // Get client name
  const getClientName = (transaction: any) => {
    if (!transaction) return "N/A";

    if (transaction.client) {
      if (typeof transaction.client === 'string') {
        return transaction.client.trim();
      }
      if (typeof transaction.client === 'object') {
        return (
          transaction.client.name || 
          transaction.client.raison_sociale || 
          transaction.client.designation || 
          'Client'
        ).trim();
      }
    }
    
    if (transaction.clientName && typeof transaction.clientName === 'string') {
      return transaction.clientName.trim();
    }
    
    if (transaction.type === 'vente_comptoire') {
      return 'Comptoir';
    }
    
    return 'Client';
  };

  // Get payment group for regular transactions
  const getPaymentGroup = (transaction: any, paymentMethods: any[]) => {
    // If it's a retenue transaction, return "Retenue"
    if (transaction.isRetenue === true) {
      return "Retenue";
    }
    
    if (!paymentMethods || paymentMethods.length === 0) {
      return "Espèces";
    }

    const m = paymentMethods[0];
    const method = m?.method?.toLowerCase() || "";
    
    if (method.includes("cheque") || method.includes("chèque")) {
      return "Chèque";
    }
    if (method.includes("traite")) {
      return "Traite";
    }
    if (method.includes("virement")) {
      return "Virement";
    }
    if (method.includes("tpe") || method.includes("carte")) {
      return "Carte";
    }
    if (method.includes("autre")) {
      return "Autre";
    }
    if (method.includes("espece") || method.includes("espèce") || method.includes("espèces")) {
      return "Espèces";
    }
    
    return "Espèces";
  };

  // Get payment label
  const getPaymentLabel = (methods: any[]) => {
    if (!methods || methods.length === 0) return "Espèces";

    const m = methods[0];
    if (!m) return "Espèces";
    
    const method = m.method?.toLowerCase() || "";

    if (method.includes("cheque") || method.includes("chèque")) {
      const banque = m.banque ? `${m.banque} ` : '';
      const numero = m.numero ? `N°${m.numero}` : '';
      return `Chèque ${banque}${numero}`.trim();
    }
    if (method.includes("traite")) {
      const numero = m.numero ? `N°${m.numero}` : '';
      const dateEcheance = m.dateEcheance ? moment(m.dateEcheance).format("DD/MM/YY") : '';
      return `Traite ${numero} ${dateEcheance}`.trim();
    }
    if (method.includes("virement")) return "Virement bancaire";
    if (method.includes("tpe") || method.includes("carte")) return "Carte Bancaire";
    if (method.includes("autre")) return "Autre";
    return m.method || "Espèces";
  };

  // Get document and payment number
  const getDocumentAndPaymentNumber = (transaction: any, isRetenue: boolean) => {
    if (!transaction) return "N/A";
    
    let docNumber = '';
    
    // Get document number
    switch(transaction.type) {
      case 'facture_direct':
        docNumber = transaction.numeroFacture || transaction.numero || '';
        break;
      case 'encaissement':
        if (transaction.source && transaction.source.includes('Facture')) {
          docNumber = transaction.source.replace('Facture ', '');
        } else {
          docNumber = transaction.numero || '';
        }
        break;
      case 'bon_commande':
        docNumber = transaction.numeroCommande || transaction.numero || '';
        break;
      case 'paiement_bc':
        if (transaction.source && transaction.source.includes('BC')) {
          docNumber = transaction.source.replace('BC ', '');
        } else {
          docNumber = transaction.numero || '';
        }
        break;
      case 'vente_comptoire':
        docNumber = transaction.numeroCommande || transaction.numero || '';
        break;
      default:
        docNumber = transaction.numero || '';
    }
    
    // For retenue, just show document number
    if (isRetenue) {
      return docNumber || 'Retenue';
    }
    
    // For regular transactions, get payment number
    let paymentNumber = '';
    const methods = transaction.paymentMethods || [];
    if (methods.length > 0) {
      const payment = methods[0];
      paymentNumber = payment.numero || '';
    }
    
    if (!paymentNumber) {
      paymentNumber = 
        transaction.numeroCheque || 
        transaction.numeroTraite || 
        transaction.numeroPaiement || 
        transaction.numeroEncaissement || 
        '';
    }
    
    // Format display
    if (docNumber && paymentNumber) {
      return `${docNumber} / ${paymentNumber}`;
    } else if (docNumber) {
      return docNumber;
    } else if (paymentNumber) {
      return `Acompte ${paymentNumber}`;
    } else {
      return 'Acompte';
    }
  };

  // Get transaction type - FIXED VERSION
  const getTypeRef = (transaction: any) => {
    if (!transaction) return "F";
    
    if (transaction.type) {
      switch(transaction.type) {
        case 'facture_direct':
        case 'encaissement':
        case 'retenue_facture':
        case 'retenue_encaissement':
          return "F";
        case 'bon_commande':
        case 'paiement_bc':
        case 'retenue_bc_direct':
        case 'retenue_bc':
          return "C";
        case 'vente_comptoire':
          return "V";
      }
    }
    
    // Fallback: Check document number for "COMMANDE" or "BC"
    const docNumber = transaction.numero || transaction.numeroCommande || '';
    if (docNumber.toUpperCase().includes('COMMANDE') || 
        docNumber.toUpperCase().includes('BC')) {
      return "C";
    }
    
    return "F"; // Default
  };

  // Process transactions
  const processTransactions = (transactions: any[]) => {
    const regularTransactions: any[] = [];
    const retenueTransactions: any[] = [];

    transactions.forEach(transaction => {
      if (!transaction) return;

      const clientName = getClientName(transaction);
      const paymentMethods = transaction.paymentMethods || [];
      
      // Filter out retenue from payment methods
      const filteredPaymentMethods = paymentMethods.filter((p: any) => {
        if (!p || !p.method) return true;
        const method = p.method.toLowerCase();
        return !method.includes('retenue') && method !== 'retention';
      });

      // Calculate regular montant from filtered payment methods
      let regularMontant = 0;
      if (filteredPaymentMethods.length > 0) {
        regularMontant = filteredPaymentMethods.reduce((sum: number, p: any) => {
          return sum + (parseFloat(p.amount) || 0);
        }, 0);
      } else {
        // If no regular payment methods, check if it has regular montant
        regularMontant = typeof transaction.montant === 'number' 
          ? transaction.montant 
          : parseFloat(transaction.montant) || 0;
      }

      const paymentLabel = getPaymentLabel(filteredPaymentMethods);
      const documentAndPayment = getDocumentAndPaymentNumber(transaction, false);
      const typeRef = getTypeRef(transaction);
      const paymentGroup = getPaymentGroup(transaction, filteredPaymentMethods);

      // Add regular transaction ONLY if it has regular payment methods or montant > 0
      // AND it's not a retenue-only transaction
      const hasRetenueInPaymentMethods = paymentMethods.some((p: any) => {
        if (!p || !p.method) return false;
        const method = p.method.toLowerCase();
        return method.includes('retenue') || method === 'retention';
      });

      if (regularMontant > 0 && !(hasRetenueInPaymentMethods && filteredPaymentMethods.length === 0)) {
        regularTransactions.push({
          ...transaction,
          montant: regularMontant,
          clientName,
          paymentLabel,
          documentAndPayment,
          typeRef,
          paymentGroup,
          isRetenue: false,
          paymentMethods: filteredPaymentMethods
        });
      }

      // Check for retenue - from hasRetenue and montantRetenue fields
      if (transaction.hasRetenue && transaction.montantRetenue) {
        const retenueAmount = parseFloat(transaction.montantRetenue) || 0;
        if (retenueAmount > 0) {
          retenueTransactions.push({
            ...transaction,
            id: `${transaction.id || 'unknown'}_retenue`,
            montant: retenueAmount,
            isRetenue: true,
            paymentLabel: "Retenue à la source",
            clientName,
            documentAndPayment: getDocumentAndPaymentNumber(transaction, true),
            typeRef: getTypeRef(transaction), // This will show C for BC
            paymentGroup: "Retenue",
            source: transaction.source || `Retenue ${transaction.numero || ''}`,
            paymentMethods: []
          });
        }
      }
    });

    return { regularTransactions, retenueTransactions };
  };

  // Process all transactions
  const { regularTransactions, retenueTransactions } = processTransactions(allTransactions);

  // Group regular transactions by payment method
  const grouped = regularTransactions.reduce((acc: any, t: any) => {
    const groupKey = t.paymentGroup || "Espèces";
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(t);
    return acc;
  }, {});

  // Add retenue transactions as a separate group
  if (retenueTransactions.length > 0) {
    grouped["Retenue"] = retenueTransactions;
  }

  // Order of groups - Retenue comes last
  const groupOrder = ["Espèces", "Chèque", "Virement", "Traite", "Carte", "Autre", "Retenue"];
  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    const ia = groupOrder.indexOf(a);
    const ib = groupOrder.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  // Calculate totals
  const totalRegular = regularTransactions.reduce((s: number, t: any) => s + (t.montant || 0), 0);
  const totalRetenue = retenueTransactions.reduce((s: number, t: any) => s + (t.montant || 0), 0);
  const totalGeneral = totalRegular + totalRetenue;

  // If no data
  if (allTransactions.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              {companyInfo.logo && <Image src={companyInfo.logo} style={styles.logo} />}
            </View>
        
          </View>

          <Text style={styles.title}>RAPPORT DES PAIEMENTS CLIENTS</Text>
          
          <View style={styles.period}>
            <Text>Période du {moment(dateRange.startDate).format("DD/MM/YYYY")} au {moment(dateRange.endDate).format("DD/MM/YYYY")}</Text>
          </View>

          <View style={{ marginTop: 50, textAlign: "center" }}>
            <Text style={{ fontSize: 12, color: "#666" }}>
              Aucune transaction trouvée pour cette période
            </Text>
          </View>

          <View style={styles.footer} fixed>
            <Text>Document généré le {moment().format("DD/MM/YYYY [à] HH:mm")} • {companyInfo.name}</Text>
            <Text>{companyInfo.address} • {companyInfo.city} • Tél: {companyInfo.phone} • MF: {companyInfo.taxId}</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {companyInfo.logo && <Image src={companyInfo.logo} style={styles.logo} />}
          </View>
      
        </View>

        <Text style={styles.title}>RAPPORT DES PAIEMENTS CLIENTS</Text>
        <Text style={styles.subtitle}></Text>
        
        <View style={styles.period}>
          <Text>Période du {moment(dateRange.startDate).format("DD/MM/YYYY")} au {moment(dateRange.endDate).format("DD/MM/YYYY")}</Text>
        </View>

        {/* Main table for all payments */}
        <View style={styles.tableContainer}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colDate]}>Date</Text>
            <Text style={[styles.headerCell, styles.colNum]}>N° Doc / Paiement</Text>
            <Text style={[styles.headerCell, styles.colClient]}>Client</Text>
            <Text style={[styles.headerCell, styles.colMode]}>Mode Paiement</Text>
            <Text style={[styles.headerCell, styles.colAmount]}>Montant</Text>
            <Text style={[styles.headerCell, styles.colRefDate]}>Date Ref</Text>
            <Text style={[styles.headerCell, styles.colType, styles.lastCell]}>Type</Text>
          </View>

          {/* All payment groups including Retenue */}
          {sortedGroups.map((groupKey) => {
            const transactions = grouped[groupKey] || [];
            const groupTotal = transactions.reduce((s: number, t: any) => s + (t.montant || 0), 0);

            if (transactions.length === 0) return null;

            return (
              <View key={groupKey}>
                {/* Group header */}
                <Text style={styles.groupHeader}>
                  {groupKey === "Chèque" ? "CHÈQUES" :
                   groupKey === "Traite" ? "TRAITES" :
                   groupKey === "Carte" ? "CARTES BANCAIRES" :
                   groupKey === "Virement" ? "VIREMENTS" :
                   groupKey === "Espèces" ? "ESPÈCES" :
                   groupKey === "Autre" ? "AUTRES" :
                   groupKey === "Retenue" ? "RETENUE À LA SOURCE" :
                   groupKey.toUpperCase()} 
                    ({transactions.length} opération{transactions.length > 1 ? "s" : ""})
                </Text>

                {/* Transactions */}
                {transactions.map((t: any, i: number) => (
                  <View 
                    key={i} 
                    style={[
                      styles.row,
                      i === transactions.length - 1 ? styles.lastRow : {}
                    ]}
                  >
                    <Text style={[styles.cell, styles.colDate, styles.textCenter]}>
                      {t.date ? moment(t.date).format("DD/MM/YY") : "N/A"}
                    </Text>
                    <Text style={[styles.cell, styles.colNum, styles.textCenter]}>
                      {t.documentAndPayment || "N/A"}
                    </Text>
                    <Text style={[styles.cell, styles.colClient, styles.textLeft]}>
                      {t.clientName || "N/A"}
                    </Text>
                    <Text style={[styles.cell, styles.colMode, styles.textLeft]}>
                      {t.paymentLabel || "N/A"}
                    </Text>
                    <Text style={[styles.cell, styles.colAmount, styles.bold, styles.textRight]}>
                      {formatAmount(t.montant)} DT
                    </Text>
                    <Text style={[styles.cell, styles.colRefDate, styles.textCenter]}>
                      {t.date ? moment(t.date).format("DD/MM/YY") : "N/A"}
                    </Text>
                    <Text style={[styles.cell, styles.colType, styles.textCenter, styles.lastCell]}>
                      {t.typeRef || "N/A"}
                    </Text>
                  </View>
                ))}

                {/* Group total */}
                <View style={styles.groupTotalRow}>
                  <Text style={[styles.groupTotalLabel, styles.textRight]}>
                    {groupKey === "Retenue" ? "TOTAL RETENUE À LA SOURCE" :
                     `Total ${groupKey === "Chèque" ? "CHÈQUES" :
                           groupKey === "Traite" ? "TRAITES" :
                           groupKey === "Carte" ? "CARTES" :
                           groupKey === "Virement" ? "VIREMENTS" :
                           groupKey === "Espèces" ? "ESPÈCES" :
                           groupKey === "Autre" ? "AUTRES" :
                           groupKey.toUpperCase()}`}
                  </Text>
                  <Text style={[styles.groupTotalValue, styles.bold, styles.textRight]}>
                    {formatAmount(groupTotal)} DT
                  </Text>
                  <View style={[styles.groupTotalSpacer, styles.lastCell]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* TOTAL GÉNÉRAL DES RECETTES (avec retenue) */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL GÉNÉRAL DES RECETTES</Text>
          <Text style={styles.totalValue}>{formatAmount(totalGeneral)} DT</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Document généré le {moment().format("DD/MM/YYYY [à] HH:mm")} • {companyInfo.name}</Text>
          <Text>{companyInfo.address} • {companyInfo.city} • Tél: {companyInfo.phone} • MF: {companyInfo.taxId}</Text>
          {retenueTransactions.length > 0 && (
            <Text style={{ marginTop: 3, fontSize: 5, color: "#999" }}>
              Note: Les montants de retenue à la source sont inclus dans le total des recettes
            </Text>
          )}
        </View>

        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} 
          fixed 
        />
      </Page>
    </Document>
  );
};

export default TrésoreriePDF;