document.addEventListener("DOMContentLoaded", function () {
    function fixChartSize(chartElement, width = 400, height = 400) {
        chartElement.width = width;
        chartElement.height = height;
    }

    // Attendee Distribution Chart
    const attendeeChartElement = document.getElementById("attendeeChart");
    if (attendeeChartElement) {
        fixChartSize(attendeeChartElement, 600, 300);
        const attendeeData = JSON.parse(attendeeChartElement.getAttribute("data-attendees"));
        const attendeeLabels = attendeeData.map(a => a.name);
        const ticketCounts = attendeeData.map(a => a.tickets);

        new Chart(attendeeChartElement.getContext("2d"), {
            type: "bar",
            data: {
                labels: attendeeLabels,
                datasets: [{
                    label: "Tickets Booked",
                    data: ticketCounts,
                    backgroundColor: "rgba(54, 162, 235, 0.7)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "#343a40",
                        titleColor: "#fff",
                        bodyColor: "#ddd"
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 14 } } },
                    y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.1)" } }
                }
            }
        });
    }

    // Review Ratings Chart (Polar Area - No More Pie/Doughnut Issues)
    const reviewChartElement = document.getElementById("reviewChart");
    if (reviewChartElement) {
        fixChartSize(reviewChartElement, 400, 400);
        const reviewData = JSON.parse(reviewChartElement.getAttribute("data-reviews"));
        const ratings = [1, 2, 3, 4, 5];
        const ratingCounts = ratings.map(rating => reviewData.filter(r => r === rating).length);

        new Chart(reviewChartElement.getContext("2d"), {
            type: "polarArea",
            data: {
                labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
                datasets: [{
                    data: ratingCounts,
                    backgroundColor: ["#dc3545", "#fd7e14", "#ffc107", "#28a745", "#007bff"],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "right", labels: { font: { size: 14 } } },
                    tooltip: {
                        backgroundColor: "#343a40",
                        titleColor: "#fff",
                        bodyColor: "#ddd"
                    }
                }
            }
        });
    }
});
