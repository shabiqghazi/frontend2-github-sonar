import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const RadialTreeChart = ({ data }) => {
    const width = 700;
    const height = 700;
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return
        const radius = width / 2;

        // Convert data to hierarchy format suitable for d3.hierarchy
        const filteredData = data.filter((o => o.data.length > 0));
        const hierarchyData = {
            name: "Root",
            children: filteredData.map(d => ({
                name: d.name,
                children: d.data?.map((commit, index) => ({
                    badCodeValue: (
                        (parseInt(commit.data.component.measures.find(o => o.metric === "minor_violations").value) * 1) +
                        (parseInt(commit.data.component.measures.find(o => o.metric === "major_violations").value) * 2) +
                        (parseInt(commit.data.component.measures.find(o => o.metric === "critical_violations").value) * 3) +
                        (parseInt(commit.data.component.measures.find(o => o.metric === "blocker_violations").value) * 4)
                    ) / (parseInt(commit.data.component.measures.find(o => o.metric === "lines").value) * 4),
                    lines: parseInt(commit.data.component.measures.find(o => o.metric === "lines").value),
                    data: commit.data.component.measures
                }))
            }))
        };
        let maxBadCode = 0;
        let maxRadius = 0;
        hierarchyData.children.forEach(child => {
            child.children.forEach(commit => {
                maxBadCode = maxBadCode < commit.badCodeValue * 100 ? commit.badCodeValue * 100 : maxBadCode
                maxRadius = maxRadius < commit.lines ? commit.lines : maxRadius
            });
        });

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${radius})`);

        const tree = d3.tree()
            .size([Math.PI, radius - 100])
            .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

        const root = d3.hierarchy(hierarchyData);
        tree(root);

        g.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkRadial()
                .angle(d => d.x - Math.PI / 2)
                .radius(d => d.y))
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 2);

        const node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `
                rotate(${(d.x - Math.PI / 2) * 180 / Math.PI - 90})
                translate(${d.y},0)
            `);

        const colorScale = d3.scaleLinear()
            .domain([0, maxBadCode * 0.25, maxBadCode * 0.5, maxBadCode]) // Adjust these thresholds based on your data
            .range(['white', 'rgba(255, 0, 0, 0.2)', 'rgba(255, 0, 0, 0.5)', 'red']);

        node.append("circle")
            .attr("r", d => d.children ? 5 : Math.sqrt(d.data.lines / (maxRadius / 1000))) // Adjust radius for leaf nodes
            .attr("fill", d => d.children ? "steelblue" : colorScale(d.data.badCodeValue * 100))
            .style('stroke', 'black')  // Border color
            .style('stroke-width', 1)  // Border width

        node.filter(d => !d.children)
            .append("title")
            .text(d => `Lines: ${d.data.data?.find(o => o.metric === "lines").value}\nDuplicate Lines: ${d.data.data?.find(o => o.metric === "duplicated_lines_density").value}%\nBad Code: ${(d.data.badCodeValue * 100).toFixed(2)}%`)

        node.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
            .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
            .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(d => d.data.name);

    }, [data]);

    return (
        <svg ref={svgRef}></svg>
    );
};

export default RadialTreeChart;
