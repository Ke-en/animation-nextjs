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
  const height = 700;

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

    // add a background rect to catch clicks (for reset)
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "transparent");

    const g = svg.append("g");

    const projection = d3
      .geoMercator()
      .center([121, 24])
      .scale(9000)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);
    /**
     * Compute a D3 zoom transform that centers and scales an SVG view to fit a given GeoJSON feature.
     *
     * 計算一個 D3 的縮放/平移變換，使 SVG 以該 GeoJSON feature 的範圍與質心為基準置中並縮放顯示。
     *
     * Behavior:
     * - Uses pathGenerator.bounds(feat) to get feature pixel bounds and derives width (dx) and height (dy).
     * - Computes a scale that fits the feature into the SVG while clamping it between 1.2 and 8:
     *     scale = clamp(0.9 / max(dx/width, dy/height), 1.2, 8)
     *   (ensures a minimum zoom level and a maximum zoom level).
     * - Uses pathGenerator.centroid(feat) as the transform center to avoid offset issues.
     * - Returns a transform that translates the view to the SVG center, applies the scale, then
     *   translates by the negative centroid so the feature is centered in the viewport.
     *
     * @param {Object} feat - GeoJSON Feature (or feature-like object) to compute bounds/centroid for.
     * @returns {import("d3-zoom").ZoomTransform} A d3 zoom transform that recenters and scales the SVG to the feature.
     */
    const computeTransformForFeature = (feat) => {
      // compute scale from feature bounds (keeps previous sizing logic)
      const bounds = pathGenerator.bounds(feat);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const scale = Math.max(
        2,
        Math.min(8, 0.9 / Math.max(dx / width, dy / height))
      );

      // use centroid as the transform center to avoid offset issues
      const [cx, cy] = pathGenerator.centroid(feat);

      // translate to center of svg, scale, then translate negative centroid
      return d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-cx, -cy);
    };

    const normalize = normalizeCountyName;
    const selectedNorm = selectedCountyName
      ? normalize(selectedCountyName)
      : null;

    // add zoom behavior (pan & zoom)
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

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
        // prevent background click
        event.stopPropagation();

        const applyTransform = (transform) => {
          svg.transition().duration(750).call(zoom.transform, transform);
        };

        applyTransform(computeTransformForFeature(d));
        onCountySelect(d.properties);
      });

    const applyTransform = (transform) => {
      svg.transition().duration(750).call(zoom.transform, transform);
    };

    svg.select("rect").on("click", () => {
      applyTransform(d3.zoomIdentity);
    });

    // add county name labels
    const labelsG = g.append("g").attr("class", "labels");

    labelsG
      .selectAll("text")
      .data(topoData.features)
      .enter()
      .append("text")
      .attr("x", (d) => {
        const c = pathGenerator.centroid(d);
        return Number.isFinite(c[0]) ? c[0] : null;
      })
      .attr("y", (d) => {
        const c = pathGenerator.centroid(d);
        return Number.isFinite(c[1]) ? c[1] : null;
      })
      .text((d) =>
        normalize(d.properties.COUNTYNAME || d.properties.COUNTY || "")
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-size", "10px")
      .style("font-weight", 700)
      .style("fill", "#ffffff")
      .style("stroke", "#000000")
      .style("stroke-width", "3px")
      .style("paint-order", "stroke")
      .style("pointer-events", "auto")
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        // prevent background click
        event.stopPropagation();

        const applyTransform = (transform) => {
          svg.transition().duration(750).call(zoom.transform, transform);
        };

        applyTransform(computeTransformForFeature(d));
        onCountySelect(d.properties);
      });

    // if parent prop requests a particular county, sync zoom to it
    if (selectedNorm) {
      const target = topoData.features.find((f) => {
        const county = normalize(
          f.properties.COUNTYNAME || f.properties.COUNTY || ""
        );
        return county === selectedNorm;
      });

      if (target) {
        applyTransform(computeTransformForFeature(target));
      }
    } else {
      // no selection -> reset to default
      applyTransform(d3.zoomIdentity);
    }
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
