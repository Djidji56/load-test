import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://www.alcyon.com/';

export const options = {
  scenarios: {
    rush_60k: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5000 },   // Palier 1 : 5 000 VUs
        { duration: '1m',  target: 15000 },  // Palier 2 : 15 000 VUs
        { duration: '1m',  target: 30000 },  // Palier 3 : 30 000 VUs
        { duration: '1m',  target: 60000 },  // Pic : 60 000 VUs
        { duration: '2m',  target: 60000 },  // Maintien du pic pendant 2 minutes
        { duration: '30s', target: 0 },      // Redescente
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'], // Objectif : 95% des réponses sous 5s
    http_req_failed: ['rate<0.10'],    // Moins de 10% d'erreurs
  },
  // Réutilisation agressive des connexions TCP pour ne pas saturer la machine
  noConnectionReuse: false,
};

export default function () {
  const res = http.get(`${BASE_URL}/`, {
    headers: { 'Accept-Encoding': 'gzip' },
    timeout: '15s',
  });

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  // Pause réaliste entre chaque action
  sleep(1);
}
