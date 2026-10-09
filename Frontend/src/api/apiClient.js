import { requestApi, backendUrl, producerUrl, SESSION_TOKEN_KEY } from '../services/http';

export { backendUrl, producerUrl, SESSION_TOKEN_KEY };

export const backendRequest = (path, options) => requestApi(backendUrl, path, options);
export const producerRequest = (path, options) => requestApi(producerUrl, path, options);
