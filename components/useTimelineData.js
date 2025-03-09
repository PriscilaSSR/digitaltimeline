import { useState, useEffect } from "react";
import timelineData from "../data/timelineData";

const useTimelineData = () => {
  const [timelineItems, setTimelineItems] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setTimelineItems(timelineData);
    const uniqueCategories = [
      ...new Set(timelineData.map((item) => item.category)),
    ];
    setCategories(uniqueCategories);
  }, []);

  return { timelineItems, categories };
};

export default useTimelineData;
