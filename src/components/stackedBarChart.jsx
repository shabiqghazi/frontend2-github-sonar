import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StackedBarChart = ({ data }) => {
    const labels = data.map(d => d.name);
    const values = data.map(d => d.value);
    const badCode = data.map(d => d.bad_code / 100 * d.value);
    const duplicateLines = data.map(d => (d.duplicate_lines / 100) * d.value);
    const remainingValue = data.map(d => d.value - duplicateLines[data.indexOf(d)]);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Bad Code',
                data: badCode,
                backgroundColor: 'rgba(255, 0, 0, 0.5)', // Red with 50% transparency
            },
            {
                label: 'Duplicate Lines',
                data: duplicateLines,
                backgroundColor: 'rgba(255, 255, 0, 0.7)', // Yellow with 70% transparency
            },
            {
                label: 'Remaining Value',
                data: remainingValue,
                backgroundColor: 'rgba(0, 0, 255, 0.5)', // Blue with 50% transparency
            },
        ],
    };

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const datasetLabel = context.dataset.label;
                        const index = context.dataIndex;
                        let displayValue;

                        if (datasetLabel === 'Bad Code') {
                            displayValue = `${datasetLabel}: ${data[index].bad_code}%`;
                        } else if (datasetLabel === 'Duplicate Lines') {
                            displayValue = `${datasetLabel}: ${data[index].duplicate_lines}%`;
                        } else {
                            displayValue = `${datasetLabel}: ${data[index].value}`;
                        }

                        return displayValue;
                    },
                },
            },
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    max: Math.max(...values), // Set the y-axis maximum to the highest total value
                },
            },
        },
    };

    return <Bar data={chartData} options={options} />;
};

export default StackedBarChart;
