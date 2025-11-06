import axios from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';
import logger from '../config/logger.js';

const postClient = axios.create({
  baseURL: process.env.POST_SERVICE_URL || 'http://localhost:4000/api',
  timeout: 3500,
});

axiosRetry(postClient, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status >= 500)
});

const breakerOptions = { timeout: 5000, errorThresholdPercentage: 50, resetTimeout: 30_000 };
function fetchPost(path) {
  const action = () => postClient.get(path).then(r => r.data);
  const breaker = new CircuitBreaker(action, breakerOptions);
  breaker.fallback((err) => {
    logger.warn('PostService fallback for %s: %s', path, err.message);
    return null;
  });
  return breaker.fire();
}

export { postClient, fetchPost };
