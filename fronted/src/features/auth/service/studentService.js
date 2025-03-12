import axios from "axios";

const apiUrl = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

export const loginStudent = async (credential) => {
    try {
        const response = await axios.post(`${apiUrl}/api/verify`, credential);
        return response.data;
    } catch (error) {
        throw error;
    }   

}
