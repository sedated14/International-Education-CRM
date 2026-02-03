"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead } from '../types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';

interface LeadContextType {
    leads: Lead[];
    addLead: (lead: Omit<Lead, 'id'>) => void;
    updateLead: (id: string | number, updates: Partial<Lead>) => void;
    deleteLead: (id: string | number) => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: React.ReactNode }) {
    const [leads, setLeads] = useState<Lead[]>([]);

    // Real-time listener
    useEffect(() => {
        const q = query(collection(db, 'leads')); // Optionally add orderBy('createdAt', 'desc') if fields match

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const leadsData: Lead[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Lead));

            // Create a map of Agencies for quick lookup
            const agencyMap = new Map<string | number, any>();
            leadsData.forEach(lead => {
                if (lead.type === 'Agent' && lead.agencyProfile) {
                    // Map by both top-level ID and agencyProfile.id to be safe
                    agencyMap.set(lead.id, lead.agencyProfile);
                    if (lead.agencyProfile.id) {
                        agencyMap.set(lead.agencyProfile.id, lead.agencyProfile);
                    }
                }
            });

            // Associate Students with Agencies
            leadsData.forEach(lead => {
                if (lead.type === 'Student' && lead.studentProfile?.agencyId) {
                    const agency = agencyMap.get(lead.studentProfile.agencyId);
                    if (agency) {
                        lead.agencyProfile = agency;
                    }
                }
            });

            // Sort manually if needed, or rely on query
            // Sorting by createdAt desc (newest first)
            leadsData.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });
            setLeads(leadsData);
        }, (error) => {
            console.error("Error fetching leads from Firestore:", error);
        });

        return () => unsubscribe();
    }, []);

    // Helper to strip undefined values (Firestore rejects them)
    // Also removes the 'id' field from the payload to avoid redundancy
    const cleanPayload = (data: any): any => {
        const cleaned = JSON.parse(JSON.stringify(data)); // Simple deep copy & strip undefineds
        delete cleaned.id; // Ensure we don't save ID as a field inside the doc
        return cleaned;
    };

    const addLead = async (leadData: Omit<Lead, 'id'>) => {
        try {
            await addDoc(collection(db, 'leads'), {
                ...cleanPayload(leadData),
                createdAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Error adding lead:", error);
        }
    };

    const updateLead = async (id: string | number, updates: Partial<Lead>) => {
        try {
            const leadRef = doc(db, 'leads', String(id));
            await updateDoc(leadRef, cleanPayload(updates));
        } catch (error) {
            console.error("Error updating lead:", error);
        }
    };

    const deleteLead = async (id: string | number) => {
        try {
            const leadRef = doc(db, 'leads', String(id));
            await deleteDoc(leadRef);
        } catch (error) {
            console.error("Error deleting lead:", error);
        }
    };

    return (
        <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead }}>
            {children}
        </LeadContext.Provider>
    );
}

export function useLeads() {
    const context = useContext(LeadContext);
    if (context === undefined) {
        throw new Error('useLeads must be used within a LeadProvider');
    }
    return context;
}
