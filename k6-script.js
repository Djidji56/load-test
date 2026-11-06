import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://www.alcyon.com/';

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 500 },  // Montée à 500 VUs
        { duration: '1m',  target: 1000 }, // Maintien à 1 000 VUs
        { duration: '30s', target: 0 },    // Descente
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% des requêtes sous 3s
    http_req_failed: ['rate<0.05'],    // Moins de 5% d'erreurs
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'status 200': (r) => r.status === 200,
  });
  sleep(1);
}
