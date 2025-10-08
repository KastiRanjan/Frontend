import PersonalDetailForm from "@/components/user/PersonalDetailForm";
import { useUserDetails } from "@/hooks/user/useUserDetails";
import { Space, Spin } from "antd";
import { useState, useEffect } from "react";
import Title from "antd/es/typography/Title";
import { useParams } from "react-router-dom";

const PersonalDetails = () => {
    const { id } = useParams();
    const { data: user, isLoading } = useUserDetails(id);
    const [processedData, setProcessedData] = useState(null);
    const [dataProcessed, setDataProcessed] = useState(false);
    
    // Process the profile data when it arrives
    useEffect(() => {
        if (user && user.profile) {
            console.log('User profile data:', user.profile);
            
            // Create a sanitized copy of the profile data
            const profileCopy = { ...user.profile };
            
            // Remove dateOfBirth to avoid validation issues - we'll set it back with proper validation
            if (profileCopy.dateOfBirth) {
                console.log('Original Date of birth:', profileCopy.dateOfBirth, 'Type:', typeof profileCopy.dateOfBirth);
                delete profileCopy.dateOfBirth;  // Delete it completely from the initial form data
            }
            
            setProcessedData(profileCopy);
            setDataProcessed(true);
        }
    }, [user]);

    return (
        <>
            <Space size="large" className="pb-4">
                <Title level={4}>Personal Details</Title>
            </Space>

            {isLoading || !dataProcessed ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Spin size="large" tip="Loading personal details..." />
                </div>
            ) : (
                <PersonalDetailForm 
                    initialValues={processedData || {
                        // Default empty values for form fields
                        department: '',
                        location: '',
                        bloodGroup: '',
                        maritalStatus: '',
                        gender: '',
                        taxCalculation: '',
                        panNo: '',
                        contactNo: '',
                        personalEmail: '',
                    }} 
                />
            )}
        </>
    );
};
export default PersonalDetails;
