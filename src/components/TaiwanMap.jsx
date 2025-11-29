"use client"; // 使用 client component

import * as d3 from "d3";
import { useRef, useEffect } from "react";
import * as topojson from "topojson-client";
import twTopo from "@/data/topo_county.json";
import { normalizeCountyName } from "@/utils/dataUtils";

const TaiwanMap = ({
  onCountySelect = () => {},
  selectedCountyName = null,
}) => {
  const ref = useRef(null);
  const width = 600;
  const height = 800;

  const topoData = topojson.feature(twTopo, twTopo.objects.COUNTY_MOI_1090820);

  useEffect(() => {
    if (!ref.current) return;

    // clear previous drawing to support prop-driven re-render
    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    const g = svg.append("g");

    const projection = d3
      .geoMercator()
      .center([121, 24])
      .scale(9000)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    const normalize = normalizeCountyName;
    const selectedNorm = selectedCountyName
      ? normalize(selectedCountyName)
      : null;

    // 繪製地圖
    g.selectAll("path")
      .data(topoData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", (d) => {
        const county = normalize(
          d.properties.COUNTYNAME || d.properties.COUNTY || ""
        );
        return selectedNorm && county === selectedNorm ? "#7dd3fc" : "#e5e7eb";
      })
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "#bfdbfe");
      })
      .on("mouseout", function (event, d) {
        const county = normalize(
          d.properties.COUNTYNAME || d.properties.COUNTY || ""
        );
        d3.select(this).attr(
          "fill",
          selectedNorm && county === selectedNorm ? "#7dd3fc" : "#e5e7eb"
        );
      })
      .on("click", function (event, d) {
        onCountySelect(d.properties);
      });
  }, [topoData.features, selectedCountyName, onCountySelect]);

  return (
    <div className="map-container relative">
      <svg
        ref={ref}
        width={width}
        height={height}
        style={{ border: "1px solid #ccc" }}
      />
    </div>
  );
};

export default TaiwanMap;
