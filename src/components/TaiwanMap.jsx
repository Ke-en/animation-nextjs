"use client"; // 使用 client component

import * as d3 from "d3";
import { useRef, useEffect } from "react";
import * as topojson from "topojson-client";
import twTopo from "@/data/topo_county.json";

const TaiwanMap = () => {
  const ref = useRef(null);
  const width = 600;
  const height = 800;

  const topoData = topojson.feature(twTopo, twTopo.objects.COUNTY_MOI_1090820);

  useEffect(() => {
    if (!ref.current) return;

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

    // 繪製地圖
    g.selectAll("path")
      .data(topoData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", "#e5e7eb")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .on("mouseover", function () {
        d3.select(this).attr("fill", "#bfdbfe");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#e5e7eb");
      });
  }, [topoData.features]);

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
