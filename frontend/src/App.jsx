import { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./App.css";

const API = "http://127.0.0.1:8000";

const ASSET_TYPES = [
  "CT Scanner",
  "Defibrillator",
  "ECG Machine",
  "Infusion Pump",
  "MRI Scanner",
  "Patient Monitor",
  "Ultrasound Machine",
  "Ventilator",
];

const DEPARTMENTS = [
  "ICU",
  "Emergency",
  "Cardiology",
];

const STATUSES = [
  "Working",
  "Under Maintenance",
  "Out of Service",
];
function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, assetsResponse] =
        await Promise.all([
          axios.get(`${API}/dashboard/summary`),
          axios.get(`${API}/assets/`),
        ]);

      setDashboard(dashboardResponse.data);

      setAssets(
        Array.isArray(assetsResponse.data)
          ? assetsResponse.data
          : []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // DELETE ASSET
  // =====================================================

  const deleteAsset = async (assetId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API}/assets/${assetId}`);
      await loadDashboard();
    } catch (err) {
      console.error(err);
      alert("Unable to delete asset.");
    }
  };

  // =====================================================
  // AI RISK CALCULATION
  // =====================================================

  const getAssetRisk = (asset) => {
    const breakdownCount =
      Number(asset.breakdown_count || 0);

    const lastServiceDays =
      Number(asset.last_service_days || 0);

    const maintenanceCount =
      Number(asset.maintenance_count || 0);

    const age =
      Number(asset.asset_age || 0);

    if (
      breakdownCount >= 3 ||
      lastServiceDays >= 180 ||
      age >= 10
    ) {
      return "High Risk";
    }

    if (
      breakdownCount >= 1 ||
      lastServiceDays >= 90 ||
      age >= 7 ||
      maintenanceCount >= 6
    ) {
      return "Medium Risk";
    }

    return "Low Risk";
  };

  // =====================================================
  // FILTER ASSETS
  // =====================================================

  const filteredAssets = assets.filter((asset) => {
    const search =
      searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      String(asset.asset_name || "")
        .toLowerCase()
        .includes(search) ||
      String(asset.manufacturer || "")
        .toLowerCase()
        .includes(search) ||
      String(asset.asset_type || "")
        .toLowerCase()
        .includes(search);

    const matchesDepartment =
      !departmentFilter ||
      asset.department === departmentFilter;

    const matchesStatus =
      !statusFilter ||
      asset.status === statusFilter;

    const matchesRisk =
      !riskFilter ||
      getAssetRisk(asset) === riskFilter;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus &&
      matchesRisk
    );
  });

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setStatusFilter("");
    setRiskFilter("");
  };

  // =====================================================
  // FILTER OPTIONS
  // =====================================================

  const departments = [
    ...new Set(
      assets
        .map((asset) => asset.department)
        .filter(Boolean)
    ),
  ];

  const statuses = [
    ...new Set(
      assets
        .map((asset) => asset.status)
        .filter(Boolean)
    ),
  ];

  // =====================================================
  // CHART DATA
  // =====================================================

  const statusChartData = [
    {
      name: "Working",
      value: Number(
        dashboard?.working_assets || 0
      ),
    },
    {
      name: "Under Maintenance",
      value: Number(
        dashboard?.under_maintenance || 0
      ),
    },
    {
      name: "Out of Service",
      value: Number(
        dashboard?.out_of_service || 0
      ),
    },
  ];

  const riskChartData = [
    {
      name: "High Risk",
      value: Number(
        dashboard?.ai_statistics
          ?.high_risk_assets || 0
      ),
    },
    {
      name: "Medium Risk",
      value: Number(
        dashboard?.ai_statistics
          ?.medium_risk_assets || 0
      ),
    },
    {
      name: "Low Risk",
      value: Number(
        dashboard?.ai_statistics
          ?.low_risk_assets || 0
      ),
    },
  ];

  const departmentChartData =
    Object.entries(
      dashboard?.department_statistics || {}
    ).map(([department, count]) => ({
      name: department,
      value: Number(count || 0),
    }));

  const riskColors = [
    "#dc2626",
    "#f59e0b",
    "#16a34a",
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page-center">
        <h2>
          Loading Biomedical Asset Dashboard...
        </h2>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="page-center">
        <h2>{error}</h2>

        <button onClick={loadDashboard}>
          Retry
        </button>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="dashboard-header">

        <div>
          <h1>
            Biomedical Asset Management System
          </h1>

          <p>
            AI-Powered Equipment Monitoring &
            Predictive Maintenance
          </p>
        </div>

        <div className="header-actions">

          <span className="ai-badge">
            AI ENABLED
          </span>

          <Link
            to="/add-asset"
            className="primary-button"
          >
            + Add Asset
          </Link>

        </div>

      </header>

      {/* =================================================
          ASSET OVERVIEW
      ================================================= */}

      <section>

        <h2>Asset Overview</h2>

        <div className="cards">

          <StatCard
            title="Total Assets"
            value={
              dashboard?.total_assets || 0
            }
          />

          <StatCard
            title="Working Assets"
            value={
              dashboard?.working_assets || 0
            }
          />

          <StatCard
            title="Under Maintenance"
            value={
              dashboard?.under_maintenance || 0
            }
          />

          <StatCard
            title="Out of Service"
            value={
              dashboard?.out_of_service || 0
            }
          />

        </div>

      </section>

      {/* =================================================
          EQUIPMENT HEALTH
      ================================================= */}

      <section>

        <h2>Equipment Health</h2>

        <div className="cards">

          <StatCard
            title="Average Health Score"
            value={`${dashboard?.average_health_score || 0}/100`}
          />

          <StatCard
            title="Healthy Assets"
            value={
              dashboard?.healthy_assets || 0
            }
          />

          <StatCard
            title="Needs Inspection"
            value={
              dashboard?.needs_inspection || 0
            }
          />

          <StatCard
            title="Critical Assets"
            value={
              dashboard?.critical_assets || 0
            }
          />

        </div>

      </section>

      {/* =================================================
          AI RISK ANALYSIS
      ================================================= */}

      <section>

        <h2>AI Risk Analysis</h2>

        <div className="cards">

          <StatCard
            title="High Risk"
            value={
              dashboard?.ai_statistics
                ?.high_risk_assets || 0
            }
          />

          <StatCard
            title="Medium Risk"
            value={
              dashboard?.ai_statistics
                ?.medium_risk_assets || 0
            }
          />

          <StatCard
            title="Low Risk"
            value={
              dashboard?.ai_statistics
                ?.low_risk_assets || 0
            }
          />

          <StatCard
            title="Average Failure Probability"
            value={`${(
              Number(
                dashboard?.ai_statistics
                  ?.average_failure_probability || 0
              ) * 100
            ).toFixed(1)}%`}
          />

        </div>

      </section>

      {/* =================================================
          ANALYTICS
      ================================================= */}

      <section className="analytics-section">

        <h2>Analytics & Insights</h2>

        <div className="charts-grid">

          {/* ASSET STATUS */}

          <div className="chart-card">

            <h3>Asset Status</h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={statusChartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="value"
                  name="Assets"
                  fill="#2563eb"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          {/* AI RISK */}

          <div className="chart-card">

            <h3>AI Risk Distribution</h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <PieChart>

                <Pie
                  data={riskChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >

                  {riskChartData.map(
                    (entry, index) => (
                      <Cell
                        key={`risk-${index}`}
                        fill={
                          riskColors[index]
                        }
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

          {/* DEPARTMENT */}

          <div className="chart-card">

            <h3>Assets by Department</h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={departmentChartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="value"
                  name="Assets"
                  fill="#16a34a"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          {/* MAINTENANCE COST */}

          <div className="chart-card">

            <h3>Maintenance Cost</h3>

            <div className="cost-display">

              ₹
              {Number(
                dashboard?.total_maintenance_cost || 0
              ).toLocaleString("en-IN")}

            </div>

            <p>
              Total maintenance expenditure
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          BIOMEDICAL ASSETS
      ================================================= */}

      <section>

        <div className="section-title-row">

          <h2>Biomedical Assets</h2>

          <Link
            to="/add-asset"
            className="primary-button"
          >
            + Add New Asset
          </Link>

        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="filter-container">

          <div className="form-group">

            <label>
              Search Asset
            </label>

            <input
              type="text"
              placeholder="Search name, type or manufacturer..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Department
            </label>

            <select
              value={departmentFilter}
              onChange={(event) =>
                setDepartmentFilter(
                  event.target.value
                )
              }
            >

              <option value="">
                All Departments
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="form-group">

            <label>
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <option value="">
                All Status
              </option>

              {statuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="form-group">

            <label>
              AI Risk
            </label>

            <select
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(
                  event.target.value
                )
              }
            >

              <option value="">
                All Risks
              </option>

              <option value="High Risk">
                High Risk
              </option>

              <option value="Medium Risk">
                Medium Risk
              </option>

              <option value="Low Risk">
                Low Risk
              </option>

            </select>

          </div>

          <button
            type="button"
            className="small-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>

        {/* =================================================
            RESULT COUNT
        ================================================= */}

        <p>

          Showing{" "}

          <strong>
            {filteredAssets.length}
          </strong>{" "}

          of{" "}

          <strong>
            {assets.length}
          </strong>{" "}

          assets

        </p>

        {/* =================================================
            ASSET TABLE
        ================================================= */}

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Manufacturer</th>
                <th>Department</th>
                <th>Status</th>
                <th>AI Risk</th>
                <th>QR Code</th>
                <th>AI Prediction</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredAssets.length === 0 ? (

                <tr>

                  <td
                    colSpan="10"
                    className="empty-cell"
                  >
                    No assets match the selected
                    search or filters.
                  </td>

                </tr>

              ) : (

                filteredAssets.map((asset) => {

                  const risk =
                    getAssetRisk(asset);

                  return (

                    <tr
                      key={asset.asset_id}
                    >

                      <td>
                        {asset.asset_id}
                      </td>

                      <td>
                        <strong>
                          {asset.asset_name}
                        </strong>
                      </td>

                      <td>
                        {asset.asset_type}
                      </td>

                      <td>
                        {asset.manufacturer}
                      </td>

                      <td>
                        {asset.department}
                      </td>

                      <td>

                        <span
                          className={`status ${getStatusClass(
                            asset.status
                          )}`}
                        >
                          {asset.status}
                        </span>

                      </td>

                      <td>

                        <span
                          className={`status ${
                            risk === "High Risk"
                              ? "out"
                              : risk === "Medium Risk"
                              ? "maintenance"
                              : "working"
                          }`}
                        >
                          {risk}
                        </span>

                      </td>

                      <td>

                        {asset.qr_code ? (

                          <a
                            href={`${API}/assets/${asset.asset_id}/qr`}
                            target="_blank"
                            rel="noreferrer"
                            className="link-button"
                          >
                            View QR
                          </a>

                        ) : (

                          "Not Available"

                        )}

                      </td>

                      <td>

                        <Link
                          to={`/assets/${asset.asset_id}`}
                          className="ai-button"
                        >
                          AI Prediction
                        </Link>

                      </td>

                      <td>

                        <div className="action-buttons">

                          <Link
                            to={`/assets/${asset.asset_id}`}
                            className="small-button"
                          >
                            View
                          </Link>

                          <Link
                            to={`/edit-asset/${asset.asset_id}`}
                            className="small-button"
                          >
                            Edit
                          </Link>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteAsset(
                                asset.asset_id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =================================================
          ASSETS BY DEPARTMENT
      ================================================= */}

      <section>

        <h2>
          Assets by Department
        </h2>

        <div className="department-list">

          {Object.entries(
            dashboard?.department_statistics || {}
          ).map(
            ([department, count]) => (

              <div
                className="department-card"
                key={department}
              >

                <h3>
                  {department}
                </h3>

                <p>
                  {count} asset(s)
                </p>

              </div>

            )
          )}

        </div>

      </section>

      {/* =================================================
          MAINTENANCE
      ================================================= */}

      <section className="maintenance-section">

        <h2>
          Maintenance Overview
        </h2>

        <div className="maintenance-card">

          <h3>
            Total Maintenance Cost
          </h3>

          <p>
            ₹
            {Number(
              dashboard?.total_maintenance_cost || 0
            ).toLocaleString("en-IN")}
          </p>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <strong>
          Biomedical Asset Management System
        </strong>

        <p>
          AI-Powered Predictive Maintenance
        </p>

      </footer>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ title, value }) {

  return (

    <div className="card">

      <h3>
        {title}
      </h3>

      <p>
        {value}
      </p>

    </div>

  );
}


/* =========================================================
   ASSET DETAILS
========================================================= */

function AssetDetails() {

  const { assetId } = useParams();

  const navigate = useNavigate();

  const [asset, setAsset] =
    useState(null);

  const [prediction, setPrediction] =
    useState(null);

  const [maintenanceRecords, setMaintenanceRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [predictionLoading, setPredictionLoading] =
    useState(true);

  const [maintenanceLoading, setMaintenanceLoading] =
    useState(true);

  const [showMaintenanceForm, setShowMaintenanceForm] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {

    loadAsset();
    loadMaintenance();

  }, [assetId]);


  /* LOAD ASSET */

  const loadAsset = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await axios.get(
          `${API}/assets/${assetId}`
        );

      setAsset(response.data);

      await loadPrediction(
        response.data.asset_id
      );

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to load asset."
      );

    } finally {

      setLoading(false);

    }

  };


  /* AI PREDICTION */

  const loadPrediction = async (id) => {

    try {

      setPredictionLoading(true);

      const response =
        await axios.post(
          `${API}/prediction/by-asset`,
          {
            asset_id: Number(id),
          }
        );

      setPrediction(response.data);

    } catch (err) {

      console.error(
        "Prediction error:",
        err
      );

      setPrediction(null);

    } finally {

      setPredictionLoading(false);

    }

  };


  /* MAINTENANCE */

  const loadMaintenance = async () => {

    try {

      setMaintenanceLoading(true);

      const response =
        await axios.get(
          `${API}/maintenance/`
        );

      const records =
        Array.isArray(response.data)
          ? response.data
          : [];

      const assetRecords =
        records.filter(
          (record) =>
            Number(record.asset_id) ===
            Number(assetId)
        );

      setMaintenanceRecords(
        assetRecords
      );

    } catch (err) {

      console.error(
        "Maintenance loading error:",
        err
      );

      setMaintenanceRecords([]);

    } finally {

      setMaintenanceLoading(false);

    }

  };


  /* DELETE */

  const deleteAsset = async () => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this asset?"
      );

    if (!confirmed) return;

    try {

      await axios.delete(
        `${API}/assets/${assetId}`
      );

      alert(
        "Asset deleted successfully."
      );

      navigate("/");

    } catch (err) {

      console.error(err);

      alert(
        "Unable to delete asset."
      );

    }

  };


  if (loading) {

    return (
      <div className="page-center">
        <h2>
          Loading asset...
        </h2>
      </div>
    );

  }


  if (error || !asset) {

    return (

      <div className="page-center">

        <h2>
          {error || "Asset not found."}
        </h2>

        <Link
          to="/"
          className="primary-button"
        >
          Back to Dashboard
        </Link>

      </div>

    );

  }


  return (

    <div className="details-page">

      {/* HEADER */}

      <div className="details-header">

        <Link
          to="/"
          className="back-button"
        >
          ← Back to Dashboard
        </Link>

        <div className="details-actions">

          <Link
            to={`/edit-asset/${asset.asset_id}`}
            className="primary-button"
          >
            Edit Asset
          </Link>

          <button
            className="delete-button"
            onClick={deleteAsset}
          >
            Delete Asset
          </button>

        </div>

      </div>


      <h1>
        Asset Details
      </h1>


      {/* ASSET INFORMATION */}

      <section className="details-section">

        <h2>
          Asset Information
        </h2>

        <div className="info-grid">

          <InfoItem
            label="Asset ID"
            value={asset.asset_id}
          />

          <InfoItem
            label="Asset Name"
            value={asset.asset_name}
          />

          <InfoItem
            label="Asset Type"
            value={asset.asset_type}
          />

          <InfoItem
            label="Manufacturer"
            value={asset.manufacturer}
          />

          <InfoItem
            label="Department"
            value={asset.department}
          />

          <InfoItem
            label="Status"
            value={asset.status}
          />

          <InfoItem
            label="Asset Age"
            value={`${asset.asset_age ?? 0} years`}
          />

          <InfoItem
            label="Usage Hours"
            value={asset.usage_hours ?? 0}
          />

          <InfoItem
            label="Maintenance Count"
            value={asset.maintenance_count ?? 0}
          />

          <InfoItem
            label="Maintenance Cost"
            value={`₹${Number(
              asset.maintenance_cost || 0
            ).toLocaleString("en-IN")}`}
          />

          <InfoItem
            label="Breakdown Count"
            value={asset.breakdown_count ?? 0}
          />

          <InfoItem
            label="Last Service"
            value={`${asset.last_service_days ?? 0} days ago`}
          />

          <InfoItem
            label="Warranty"
            value={asset.warranty ?? "No"}
          />

        </div>


        {asset.qr_code && (

          <div className="qr-section">

            <h3>
              Asset QR Code
            </h3>

            <a
              href={`${API}/assets/${asset.asset_id}/qr`}
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              View QR Code
            </a>

          </div>

        )}

      </section>


      {/* AI PREDICTION */}

      <section className="details-section">

        <h2>
          AI Failure Prediction
        </h2>

        {predictionLoading ? (

          <div className="loading-box">
            Generating AI prediction...
          </div>

        ) : prediction ? (

          <>

            <div className="prediction-grid">

              <PredictionItem
                label="Failure Risk"
                value={prediction.failure_risk}
              />

              <PredictionItem
                label="Failure Probability"
                value={`${(
                  Number(
                    prediction.probability || 0
                  ) * 100
                ).toFixed(1)}%`}
              />

              <PredictionItem
                label="Health Score"
                value={`${prediction.health_score}/100`}
              />

              <PredictionItem
                label="Priority"
                value={prediction.priority}
              />

              <PredictionItem
                label="Estimated Remaining Life"
                value={`${prediction.estimated_remaining_life_days} days`}
              />

              <PredictionItem
                label="Recommended Action"
                value={prediction.recommended_action}
              />

            </div>


            {prediction.ai_analysis && (

              <div className="ai-analysis">

                <h2>
                  Gemini AI Engineering Analysis
                </h2>

                <div className="analysis-content">
                  {prediction.ai_analysis}
                </div>

              </div>

            )}

          </>

        ) : (

          <div className="error-box">

            Unable to generate AI prediction.

            <br />

            Please check the backend.

          </div>

        )}

      </section>


      {/* MAINTENANCE HISTORY */}

      <section className="details-section">

        <div className="section-title-row">

          <h2>
            Maintenance History
          </h2>

          <button
            className="primary-button"
            onClick={() =>
              setShowMaintenanceForm(
                !showMaintenanceForm
              )
            }
          >
            {showMaintenanceForm
              ? "Close Form"
              : "+ Add Maintenance"}
          </button>

        </div>


        {showMaintenanceForm && (

          <MaintenanceForm
            assetId={assetId}
            onSuccess={() => {

              setShowMaintenanceForm(false);

              loadMaintenance();

            }}
          />

        )}


        {maintenanceLoading ? (

          <div className="loading-box">
            Loading maintenance records...
          </div>

        ) : maintenanceRecords.length === 0 ? (

          <div className="empty-cell">
            No maintenance records found for
            this asset.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>Date</th>
                  <th>Type</th>
                  <th>Engineer</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Remarks</th>

                </tr>

              </thead>

              <tbody>

                {maintenanceRecords.map(
                  (record) => (

                    <tr
                      key={
                        record.maintenance_id
                      }
                    >

                      <td>
                        {
                          record.maintenance_date
                        }
                      </td>

                      <td>
                        {
                          record.maintenance_type
                        }
                      </td>

                      <td>
                        {
                          record.engineer_name
                        }
                      </td>

                      <td>
                        ₹
                        {Number(
                          record.cost || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        {record.status}
                      </td>

                      <td>
                        {record.remarks}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>

  );
}


/* =========================================================
   MAINTENANCE FORM
========================================================= */

function MaintenanceForm({
  assetId,
  onSuccess,
}) {

  const [form, setForm] = useState({

    maintenance_date:
      new Date()
        .toISOString()
        .split("T")[0],

    maintenance_type:
      "Preventive",

    engineer_name:
      "",

    cost:
      0,

    status:
      "Completed",

    remarks:
      "",

  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      setLoading(true);
      setError("");

      const payload = {

        asset_id:
          Number(assetId),

        maintenance_date:
          form.maintenance_date,

        maintenance_type:
          form.maintenance_type,

        engineer_name:
          form.engineer_name.trim(),

        cost:
          Number(form.cost),

        status:
          form.status,

        remarks:
          form.remarks.trim(),

      };

      await axios.post(
        `${API}/maintenance/`,
        payload
      );

      alert(
        "Maintenance record added successfully."
      );

      onSuccess();

    } catch (err) {

      console.error(err);

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {

        setError(
          detail
            .map(
              (item) =>
                `${item.loc?.join(".") || "field"}: ${item.msg}`
            )
            .join(" | ")
        );

      } else {

        setError(
          detail ||
          "Unable to add maintenance record."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="form-card">

      <form onSubmit={handleSubmit}>

        <h3>
          Add Maintenance Record
        </h3>


        <div className="form-group">

          <label>
            Maintenance Date
          </label>

          <input
            type="date"
            name="maintenance_date"
            value={
              form.maintenance_date
            }
            onChange={handleChange}
            required
          />

        </div>


        <div className="form-group">

          <label>
            Maintenance Type
          </label>

          <select
            name="maintenance_type"
            value={
              form.maintenance_type
            }
            onChange={handleChange}
            required
          >

            <option value="Preventive">
              Preventive
            </option>

            <option value="Corrective">
              Corrective
            </option>

            <option value="Emergency">
              Emergency
            </option>

            <option value="Calibration">
              Calibration
            </option>

            <option value="Inspection">
              Inspection
            </option>

          </select>

        </div>


        <div className="form-group">

          <label>
            Engineer Name
          </label>

          <input
            type="text"
            name="engineer_name"
            value={
              form.engineer_name
            }
            onChange={handleChange}
            placeholder="Example: Ravi Kumar"
            required
          />

        </div>


        <div className="form-group">

          <label>
            Cost
          </label>

          <input
            type="number"
            name="cost"
            value={form.cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />

        </div>


        <div className="form-group">

          <label>
            Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >

            <option value="Completed">
              Completed
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="In Progress">
              In Progress
            </option>

          </select>

        </div>


        <div className="form-group">

          <label>
            Remarks
          </label>

          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Enter maintenance remarks"
            rows="4"
          />

        </div>


        {error && (

          <div className="error-box">
            {error}
          </div>

        )}


        <button
          type="submit"
          className="primary-button"
          disabled={loading}
        >

          {loading
            ? "Saving..."
            : "Save Maintenance"}

        </button>

      </form>

    </div>

  );
}


/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}) {

  return (

    <div className="info-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );
}


/* =========================================================
   PREDICTION ITEM
========================================================= */

function PredictionItem({
  label,
  value,
}) {

  return (

    <div className="prediction-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );
}


/* =========================================================
   ADD ASSET
========================================================= */

function AddAsset() {

  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({

      asset_name: "",
      asset_type: "",
      manufacturer: "",
      department: "",
      status: "Working",

      asset_age: 0,
      usage_hours: 0,
      maintenance_count: 0,
      maintenance_cost: 0,
      breakdown_count: 0,
      last_service_days: 0,
      warranty: "Yes",

    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      setLoading(true);
      setError("");

      const payload = {

        asset_name:
          form.asset_name.trim(),

        asset_type:
          form.asset_type,

        manufacturer:
          form.manufacturer.trim(),

        department:
          form.department,

        status:
          form.status,

        asset_age:
          Number(form.asset_age),

        usage_hours:
          Number(form.usage_hours),

        maintenance_count:
          Number(form.maintenance_count),

        maintenance_cost:
          Number(form.maintenance_cost),

        breakdown_count:
          Number(form.breakdown_count),

        last_service_days:
          Number(form.last_service_days),

        warranty:
          form.warranty,

      };

      await axios.post(
        `${API}/assets/`,
        payload
      );

      alert(
        "Asset created successfully."
      );

      navigate("/");

    } catch (err) {

      console.error(err);

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {

        setError(
          detail
            .map(
              (item) =>
                `${item.loc?.join(".") || "field"}: ${item.msg}`
            )
            .join(" | ")
        );

      } else {

        setError(
          detail ||
          "Unable to create asset."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="form-page">

      <Link
        to="/"
        className="back-button"
      >
        ← Back to Dashboard
      </Link>

      <h1>
        Add New Biomedical Asset
      </h1>

      <div className="form-card">

        <form onSubmit={handleSubmit}>

          <h2>
            Asset Information
          </h2>

          <FormInput
            label="Asset Name"
            name="asset_name"
            value={form.asset_name}
            onChange={handleChange}
            placeholder="Example: ECG Machine"
            required
          />

          <SelectInput
            label="Asset Type"
            name="asset_type"
            value={form.asset_type}
            onChange={handleChange}
            options={ASSET_TYPES}
            placeholder="Select Asset Type"
          />

          <FormInput
            label="Manufacturer"
            name="manufacturer"
            value={form.manufacturer}
            onChange={handleChange}
            placeholder="Example: Philips"
            required
          />

          <SelectInput
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            options={DEPARTMENTS}
            placeholder="Select Department"
          />

          <SelectInput
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={STATUSES}
          />

          <h2>
            Equipment Telemetry
          </h2>

          <div className="form-grid">

            <NumberInput
              label="Asset Age (years)"
              name="asset_age"
              value={form.asset_age}
              onChange={handleChange}
            />

            <NumberInput
              label="Usage Hours"
              name="usage_hours"
              value={form.usage_hours}
              onChange={handleChange}
            />

            <NumberInput
              label="Maintenance Count"
              name="maintenance_count"
              value={form.maintenance_count}
              onChange={handleChange}
            />

            <NumberInput
              label="Maintenance Cost"
              name="maintenance_cost"
              value={form.maintenance_cost}
              onChange={handleChange}
              step="0.01"
            />

            <NumberInput
              label="Breakdown Count"
              name="breakdown_count"
              value={form.breakdown_count}
              onChange={handleChange}
            />

            <NumberInput
              label="Last Service (days ago)"
              name="last_service_days"
              value={form.last_service_days}
              onChange={handleChange}
            />

          </div>

          <SelectInput
            label="Warranty"
            name="warranty"
            value={form.warranty}
            onChange={handleChange}
            options={[
              "Yes",
              "No",
            ]}
          />

          {error && (

            <div className="error-box">
              {error}
            </div>

          )}

          <button
            type="submit"
            className="primary-button submit-button"
            disabled={loading}
          >

            {loading
              ? "Creating Asset..."
              : "Create Asset"}

          </button>

        </form>

      </div>

    </div>

  );
}


/* =========================================================
   EDIT ASSET
========================================================= */

function EditAsset() {

  const { assetId } =
    useParams();

  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({

      asset_name: "",
      asset_type: "",
      manufacturer: "",
      department: "",
      status: "Working",

      asset_age: 0,
      usage_hours: 0,
      maintenance_count: 0,
      maintenance_cost: 0,
      breakdown_count: 0,
      last_service_days: 0,
      warranty: "Yes",

    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {

    loadAsset();

  }, [assetId]);


  const loadAsset = async () => {

    try {

      setLoading(true);

      const response =
        await axios.get(
          `${API}/assets/${assetId}`
        );

      const data =
        response.data;

      setForm({

        asset_name:
          data.asset_name || "",

        asset_type:
          data.asset_type || "",

        manufacturer:
          data.manufacturer || "",

        department:
          data.department || "",

        status:
          data.status || "Working",

        asset_age:
          data.asset_age ?? 0,

        usage_hours:
          data.usage_hours ?? 0,

        maintenance_count:
          data.maintenance_count ?? 0,

        maintenance_cost:
          data.maintenance_cost ?? 0,

        breakdown_count:
          data.breakdown_count ?? 0,

        last_service_days:
          data.last_service_days ?? 0,

        warranty:
          data.warranty || "Yes",

      });

    } catch (err) {

      console.error(err);

      setError(
        "Unable to load asset."
      );

    } finally {

      setLoading(false);

    }

  };


  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      setSaving(true);
      setError("");

      const payload = {

        asset_name:
          form.asset_name.trim(),

        asset_type:
          form.asset_type,

        manufacturer:
          form.manufacturer.trim(),

        department:
          form.department,

        status:
          form.status,

        asset_age:
          Number(form.asset_age),

        usage_hours:
          Number(form.usage_hours),

        maintenance_count:
          Number(form.maintenance_count),

        maintenance_cost:
          Number(form.maintenance_cost),

        breakdown_count:
          Number(form.breakdown_count),

        last_service_days:
          Number(form.last_service_days),

        warranty:
          form.warranty,

      };

      await axios.put(
        `${API}/assets/${assetId}`,
        payload
      );

      alert(
        "Asset updated successfully."
      );

      navigate(
        `/assets/${assetId}`
      );

    } catch (err) {

      console.error(err);

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {

        setError(
          detail
            .map(
              (item) =>
                `${item.loc?.join(".") || "field"}: ${item.msg}`
            )
            .join(" | ")
        );

      } else {

        setError(
          detail ||
          "Unable to update asset."
        );

      }

    } finally {

      setSaving(false);

    }

  };


  if (loading) {

    return (

      <div className="page-center">

        <h2>
          Loading asset...
        </h2>

      </div>

    );

  }


  return (

    <div className="form-page">

      <Link
        to={`/assets/${assetId}`}
        className="back-button"
      >
        ← Back to Asset
      </Link>

      <h1>
        Edit Biomedical Asset
      </h1>

      <div className="form-card">

        <form onSubmit={handleSubmit}>

          <h2>
            Asset Information
          </h2>

          <FormInput
            label="Asset Name"
            name="asset_name"
            value={form.asset_name}
            onChange={handleChange}
            required
          />

          <SelectInput
            label="Asset Type"
            name="asset_type"
            value={form.asset_type}
            onChange={handleChange}
            options={ASSET_TYPES}
          />

          <FormInput
            label="Manufacturer"
            name="manufacturer"
            value={form.manufacturer}
            onChange={handleChange}
            required
          />

          <SelectInput
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            options={DEPARTMENTS}
          />

          <SelectInput
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={STATUSES}
          />

          <h2>
            Equipment Telemetry
          </h2>

          <div className="form-grid">

            <NumberInput
              label="Asset Age (years)"
              name="asset_age"
              value={form.asset_age}
              onChange={handleChange}
            />

            <NumberInput
              label="Usage Hours"
              name="usage_hours"
              value={form.usage_hours}
              onChange={handleChange}
            />

            <NumberInput
              label="Maintenance Count"
              name="maintenance_count"
              value={form.maintenance_count}
              onChange={handleChange}
            />

            <NumberInput
              label="Maintenance Cost"
              name="maintenance_cost"
              value={form.maintenance_cost}
              onChange={handleChange}
              step="0.01"
            />

            <NumberInput
              label="Breakdown Count"
              name="breakdown_count"
              value={form.breakdown_count}
              onChange={handleChange}
            />

            <NumberInput
              label="Last Service (days ago)"
              name="last_service_days"
              value={form.last_service_days}
              onChange={handleChange}
            />

          </div>

          <SelectInput
            label="Warranty"
            name="warranty"
            value={form.warranty}
            onChange={handleChange}
            options={[
              "Yes",
              "No",
            ]}
          />

          {error && (

            <div className="error-box">
              {error}
            </div>

          )}

          <button
            type="submit"
            className="primary-button submit-button"
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </form>

      </div>

    </div>

  );
}


/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {

  return (

    <div className="form-group">

      <label>
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />

    </div>

  );
}


/* =========================================================
   SELECT INPUT
========================================================= */

function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}) {

  return (

    <div className="form-group">

      <label>
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required
      >

        {placeholder && (

          <option value="">
            {placeholder}
          </option>

        )}

        {options.map(
          (option) => (

            <option
              key={option}
              value={option}
            >
              {option}
            </option>

          )
        )}

      </select>

    </div>

  );

}


/* =========================================================
   NUMBER INPUT
========================================================= */

function NumberInput({
  label,
  name,
  value,
  onChange,
  step = "1",
}) {

  return (

    <div className="form-group">

      <label>
        {label}
      </label>

      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min="0"
        step={step}
        required
      />

    </div>

  );

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

  if (status === "Working") {
    return "working";
  }

  if (
    status === "Under Maintenance"
  ) {
    return "maintenance";
  }

  if (
    status === "Out of Service"
  ) {
    return "out";
  }

  return "";

}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/assets/:assetId"
          element={<AssetDetails />}
        />

        <Route
          path="/add-asset"
          element={<AddAsset />}
        />

        <Route
          path="/edit-asset/:assetId"
          element={<EditAsset />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;