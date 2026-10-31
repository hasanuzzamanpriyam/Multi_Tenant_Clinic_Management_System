import PatientForm from './form';

export default function EditPatient({ patient }: { patient: any }) {
    return <PatientForm patient={patient} />;
}

