import './AttendanceChart.css';

export default function AttendanceChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>No attendance data available for the last 7 days.</p>
            </div>
        );
    }

    const maxTotal = Math.max(...data.map(d => d.total), 5); // Fallback to 5 if empty

    return (
        <div className="attendance-chart card">
            <div className="chart-header">
                <h3>Weekly Attendance Comparison</h3>
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-dot legend-present"></span>
                        <span>Present</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot legend-absent"></span>
                        <span>Absent</span>
                    </div>
                </div>
            </div>

            <div className="chart-body">
                <div className="chart-y-axis">
                    <span>{maxTotal}</span>
                    <span>{Math.round(maxTotal / 2)}</span>
                    <span>0</span>
                </div>

                <div className="chart-bars-container">
                    {data.map((day, index) => {
                        const date = new Date(day.date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();

                        const presentHeight = (day.present / maxTotal) * 100;
                        const absentHeight = (day.absent / maxTotal) * 100;

                        return (
                            <div key={day.date} className="chart-column">
                                <div className="bar-group">
                                    <div
                                        className="bar bar-present"
                                        style={{ height: `${presentHeight}%` }}
                                        title={`Present: ${day.present}`}
                                    >
                                        {day.present > 0 && <span className="bar-value">{day.present}</span>}
                                    </div>
                                    <div
                                        className="bar bar-absent"
                                        style={{ height: `${absentHeight}%` }}
                                        title={`Absent: ${day.absent}`}
                                    >
                                        {day.absent > 0 && <span className="bar-value">{day.absent}</span>}
                                    </div>
                                </div>
                                <div className="chart-label">
                                    <span className="day-name">{dayName}</span>
                                    <span className="day-num">{dayNum}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
