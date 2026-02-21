const axios = require('axios');

async function verify() {
    console.log("Starting ML Endpoint Verification...");

    const tests = [
        {
            name: "Resource Exhaustion Prediction",
            url: "http://127.0.0.1:5000/api/ml/resource-forecast",
            payload: {
                ventilators_avail: 5,
                staff_on_duty: 10,
                oxygen_level: 50,
                patient_acuity_avg: 3,
                admission_rate: 5
            }
        },
        {
            name: "Network Stress Prediction",
            url: "http://127.0.0.1:5000/api/ml/network-stress",
            payload: {
                region_load: 65,
                neighbor_dist: 12,
                neighbor_avail: 20,
                local_icu: 80
            }
        },
        {
            name: "Reallocation Proposals",
            url: "http://127.0.0.1:5000/api/ml/realloc-proposals",
            payload: {
                stress_index: 75,
                region_load: 60,
                local_icu: 90
            }
        }
    ];

    for (const test of tests) {
        console.log(`\nTesting ${test.name}...`);
        try {
            const response = await axios.post(test.url, test.payload);
            console.log(`Status: ${response.status}`);
            console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);

            if (response.status === 200 && !response.data.error) {
                console.log(`✅ ${test.name} PASSED`);
            } else {
                console.log(`❌ ${test.name} FAILED: ${response.data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.log(`❌ ${test.name} ERROR: ${err.message}`);
            if (err.response) {
                console.log(`Response Data: ${JSON.stringify(err.response.data, null, 2)}`);
            }
        }
    }
}

verify();
