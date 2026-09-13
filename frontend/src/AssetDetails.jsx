import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function AssetDetails() {
  const { assetId } = useParams();

  const [asset, setAsset] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAsset();
    loadPrediction();
  }, [assetId]);

  const loadAsset = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/assets/${assetId}`
      );

      setAsset(response.data);
    } catch (error) {
      console.error(error);
      setError("Unable to load asset details.");
    } finally {
      setLoading(false);
    }
  };

  const loadPrediction = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/prediction/by-asset",
        {
          asset_id: Number(assetId),
        }
      );

      setPrediction(response.data);
    } catch (error) {
      console.error(error);
      setPrediction(null);
    } finally {
      setPredictionLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading asset details...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!asset) {
    return <h2>Asset not found.</h2>;
  }

  return (
    <div style={styles.container}>

      <Link to="/" style={styles.backButton}>
        ← Back to Dashboard
      </Link>

      <h1>Asset Details</h1>

      {/* Asset Information */}
      <section style={styles.section}>
        <h2>Asset Information</h2>

        <div style={styles.grid}>

          <div style={styles.card}>
            <h3>Asset ID</h3>
            <p>{asset.asset_id}</p>
          </div>

          <div style={styles.card}>
            <h3>Asset Name</h3>
            <p>{asset.asset_name}</p>
          </div>

          <div style={styles.card}>
            <h3>Asset Type</h3>
            <p>{asset.asset_type}</p>
          </div>

          <div style={styles.card}>
            <h3>Manufacturer</h3>
            <p>{asset.manufacturer}</p>
          </div>

          <div style={styles.card}>
            <h3>Department</h3>
            <p>{asset.department}</p>
          </div>

          <div style={styles.card}>
            <h3>Status</h3>
            <p>{asset.status}</p>
          </div>

        </div>
      </section>

      {/* AI Prediction */}
      <section style={styles.section}>
        <h2>AI Failure Prediction</h2>

        {predictionLoading && (
          <p>Generating AI prediction...</p>
        )}

        {!predictionLoading && !prediction && (
          <p>
            Unable to generate AI prediction for this asset.
          </p>
        )}

        {prediction && (
          <div style={styles.grid}>

            <div style={styles.card}>
              <h3>Failure Risk</h3>
              <p>{prediction.failure_risk}</p>
            </div>

            <div style={styles.card}>
              <h3>Failure Probability</h3>
              <p>{(prediction.probability * 100).toFixed(1)}%</p>
            </div>

            <div style={styles.card}>
              <h3>Health Score</h3>
              <p>{prediction.health_score}/100</p>
            </div>

            <div style={styles.card}>
              <h3>Priority</h3>
              <p>{prediction.priority}</p>
            </div>

            <div style={styles.card}>
              <h3>Estimated Remaining Life</h3>
              <p>
                {prediction.estimated_remaining_life_days} days
              </p>
            </div>

            <div style={styles.card}>
              <h3>Recommended Action</h3>
              <p>{prediction.recommended_action}</p>
            </div>

          </div>
        )}
      </section>

      {/* Gemini Analysis */}
      {prediction?.ai_analysis && (
        <section style={styles.section}>
          <h2>Gemini AI Engineering Analysis</h2>

          <div style={styles.analysis}>
            {prediction.ai_analysis}
          </div>
        </section>
      )}

    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },

  backButton: {
    display: "inline-block",
    marginBottom: "20px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  section: {
    marginTop: "30px",
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  card: {
    padding: "20px",
    borderRadius: "10px",
    background: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  analysis: {
    whiteSpace: "pre-wrap",
    padding: "25px",
    borderRadius: "10px",
    background: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    lineHeight: "1.6",
  },
};

export default AssetDetails;