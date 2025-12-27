import { useLocation, useNavigate } from "react-router-dom"
import styles from "./styles/SearchResults.module.css";

const SearchResults = () => {
  const location = useLocation()
  const navigate = useNavigate();
  let results = location.state
  
  // Ensure results is an array
  if (!Array.isArray(results)) {
    results = [];
  }
  
  return (
    !results || results.length == 0
      ?
      <div className={styles["no-results"]}>
        <img src='./images/noresults.svg' />
        <h1>Hmm. We couldn't find any results.</h1>
        <h6 className={styles['spelling']}>Double-check your spelling or try different keywords.</h6>
      </div>
      :
      <ul className={styles['results']}>
        <h1>Results</h1>
        {results.map((resultData) =>
          <li
            key={resultData.id}
            onClick={() => navigate(`/c/${resultData.name}`)}
          >
            <div>
              <h1>c/{resultData.name}</h1>
            </div>
          </li>
        )
        }
      </ul>
  )
}
export default SearchResults
