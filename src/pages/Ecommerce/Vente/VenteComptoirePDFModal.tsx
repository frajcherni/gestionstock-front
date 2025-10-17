import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import VenteComptoirePDF from './VenteComptoirePDF';
import VenteComptoireReceiptPDF from './VenteComptoireReceiptPDF';
import { BonCommandeClient } from '../../../Components/Article/Interfaces';

interface VenteComptoirePDFModalProps {
  isOpen: boolean;
  toggle: () => void;
  bonCommande: BonCommandeClient | null;
  companyInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
  };
  pdfType: 'facture' | 'receipt';
}

const VenteComptoirePDFModal: React.FC<VenteComptoirePDFModalProps> = ({ isOpen, toggle, bonCommande, companyInfo, pdfType }) => {
  if (!bonCommande) return null;

  const PDFComponent = pdfType === 'facture' ? VenteComptoirePDF : VenteComptoireReceiptPDF;
  const fileName = pdfType === 'facture' ? `Facture_${bonCommande.numeroCommande}.pdf` : `Recu_${bonCommande.numeroCommande}.pdf`;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        {pdfType === 'facture' ? `Aperçu Facture #${bonCommande.numeroCommande}` : `Aperçu Reçu #${bonCommande.numeroCommande}`}
      </ModalHeader>
      <ModalBody style={{ height: '60vh' }}>
        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
          <PDFComponent bonCommande={bonCommande} companyInfo={companyInfo} />
        </PDFViewer>
      </ModalBody>
      <ModalFooter>
        <PDFDownloadLink
          document={<PDFComponent bonCommande={bonCommande} companyInfo={companyInfo} />}
          fileName={fileName}
        >
          {({ loading }) => (
            <Button color="primary" disabled={loading}>
              <i className="ri-download-line me-1"></i>
              {loading ? 'Génération...' : 'Télécharger PDF'}
            </Button>
          )}
        </PDFDownloadLink>
        <Button color="secondary" onClick={toggle}>
          Fermer
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default VenteComptoirePDFModal;