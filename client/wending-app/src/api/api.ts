import axios from "axios";

const instance = axios.create({
	baseURL: 'http://localhost:5136/'
});

export default instance;