import envConfig from "../../envConfig"

export function createURINFTTemplate(siscode, mfsCID) {
    const universityName = "Universidad Mayor de San Simon - UMSS"; 
    const issueDate = new Date().toISOString();
    
    return {
        "name": `Kardex Estudiantil-${siscode}`,
        "description": `Kardex académico oficial del estudiante con SIS code ${siscode}, emitido por ${universityName}`,
        "external_url": `${envConfig.IPFS_GATEWAY}${mfsCID}`,
        "university": universityName,
        "issue_date": issueDate,
        "student_sis_code": siscode,
        "document_type": "Academic Transcript",
        "attributes": [
            {
                "trait_type": "University",
                "value": universityName
            },
            {
                "trait_type": "Issue Date",
                "value": issueDate
            },
            {
                "trait_type": "SIS Code", 
                "value": siscode
            },
            {
                "trait_type": "Document Type",
                "value": "Kardex Estudiantil"
            }
        ],
        "files": {
            "directory_cid": mfsCID,
            "access_url": `${envConfig.IPFS_GATEWAY}${mfsCID}`
        }
    }
}