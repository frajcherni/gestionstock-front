import axios from "axios";
import { FactureClient , EncaissementClient} from "../../../Components/Article/Interfaces";

const API_URL = "http://54.37.159.225:5000/api";



export const fetchFacturesClient = async (): Promise<FactureClient[]> => {
    debugger
    try {
        const response = await fetch(`${API_URL}/factures-client/getAllFacturesClient`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des factures');
        
        const data = await response.json();
        console.log('Factures data:', data); // Debug log
        
        // The API returns an array directly
        if (Array.isArray(data)) {
            return data;
        } else {
            console.warn('Unexpected API response structure:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching factures:', error);
        return [];
    }
};

export const fetchFactureClientById = async (id: number): Promise<FactureClient> => {
    try {
        const response = await axios.get(`${API_URL}/factures-client/${id}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Échec de la récupération de la facture client");
    }
};


export const createFacture = async (factureData: any): Promise<FactureClient> => {
    try {
        // Validate and map articles array
        const articles = factureData.articles?.map((item: any) => ({
            article_id: Number(item.article_id),
            quantite: Number(item.quantite),
            prix_unitaire: Number(item.prixUnitaire || item.prix_unitaire), // Map prixUnitaire to prix_unitaire
            tva: item.tva ? Number(item.tva) : undefined,
            remise: item.remise ? Number(item.remise) : undefined
        })) || [];

        if (!articles.length) {
            throw new Error("Les articles sont requis");
        }
debugger
        const response = await axios.post(`${API_URL}/factures-client/addAllFacturesClient`, {
            numeroFacture: factureData.numeroFacture,
            dateFacture: factureData.dateFacture,
            dateEcheance: factureData.dateEcheance,
            status: factureData.status,
            conditions: factureData.conditions || "Net à réception", // Default to avoid missing field
            client_id: Number(factureData.client_id),
            vendeur_id: factureData.vendeur_id ? Number(factureData.vendeur_id) : undefined,
            bonLivraison_id: factureData.bonLivraison_id ? Number(factureData.bonLivraison_id) : undefined,
            articles,
            modeReglement: factureData.modeReglement,
            totalHT: Number(factureData.totalHT || 0),
            totalTVA: Number(factureData.totalTVA || 0),
            totalTTC: Number(factureData.totalTTC || 0),
            notes: factureData.notes || undefined,
            remise: Number(factureData.remise || 0),
            remiseType: factureData.remiseType || "percentage",
            montantPaye: Number(factureData.montantPaye || 0),
            timbreFiscal: factureData.timbreFiscal ?? false,
            conditionPaiement: factureData.conditionPaiement || null,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Échec de la création de la facture client");
    }
};



export const updateFacture = async (id: number, factureData: Partial<FactureClient>): Promise<FactureClient> => {
   
    try {
        const response = await fetch(`${API_URL}/factures-client/updateFactureClient/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(factureData),
        });
        if (!response.ok) {
            throw new Error('Failed to update client order');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating client order:', error);
        throw error;
    }
};
export const deleteFacture = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/factures-client/deleteFactureClient/${id}`);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Échec de la suppression de la facture client");
    }
};

export const annulerFacture = async (id: number): Promise<void> => {
    try {
        await axios.post(`${API_URL}/${id}/annuler`);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Échec de l'annulation de la facture client");
    }
};

export const fetchEncaissementsClient = async (): Promise<EncaissementClient[]> => {
    debugger
    try {
        const response = await fetch(`${API_URL}/EncaissementClient/getAllEncaissements`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des encaissements');
        
        const data = await response.json();
        console.log(data)
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching encaissements:', error);
        return [];
    }
};

export const fetchEncaissementClient = async (id: number): Promise<EncaissementClient> => {
    try {
        const response = await fetch(`${API_URL}/EncaissementClient/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching encaissement:', error);
        throw new Error("Échec de la récupération de l'encaissement");
    }
};

export const createEncaissementClient = async (encaissementData: Partial<EncaissementClient>): Promise<EncaissementClient> => {
    try {
        const response = await fetch(`${API_URL}/EncaissementClient/createencaissement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                facture_id: Number(encaissementData.facture_id),
                montant: Number(encaissementData.montant),
                modePaiement: encaissementData.modePaiement,
                numeroEncaissement: encaissementData.numeroEncaissement,
                date: encaissementData.date,
                client_id: encaissementData.client_id
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating encaissement:', error);
        throw new Error("Échec de la création de l'encaissement");
    }
};

export const updateEncaissementClient = async (id: number, encaissementData: Partial<EncaissementClient>): Promise<EncaissementClient> => {
    try {
        const response = await fetch(`${API_URL}/EncaissementClient/updateEncaissement/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                facture_id: Number(encaissementData.facture_id),
                montant: Number(encaissementData.montant),
                modePaiement: encaissementData.modePaiement,
                numeroEncaissement: encaissementData.numeroEncaissement,
                date: encaissementData.date,
                client_id: Number(encaissementData.client_id), // Add this line

            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating encaissement:', error);
        throw new Error("Échec de la mise à jour de l'encaissement");
    }
};

export const deleteEncaissementClient = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/EncaissementClient/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting encaissement:', error);
        throw new Error("Échec de la suppression de l'encaissement");
    }
};

export const fetchNextEncaissementNumberFromAPI = async (): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/EncaissementClient/getNextEncaissementNumber`);
        if (!response.ok) throw new Error("Failed to fetch next encaissement number");
        const data = await response.json();
        return data.numeroEncaissement || `ENC-C${new Date().getFullYear()}00001`;
    } catch (error) {
        console.error("Error fetching next encaissement number:", error);
        return `ENC-C${new Date().getFullYear()}00001`;
    }
};

export const fetchNextFactureNumberFromAPI = async (): Promise<string> => {
    try {
        const response = await fetch(`${API_URL}/factures-client/getNextFactureNumber`);
        if (!response.ok) throw new Error("Failed to fetch next reception number");
        const data = await response.json();
        return data.numeroFacture;
    } catch (error) {
        console.error("Error fetching next reception number:", error);
        throw error;
    }
};
