import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const BubbleChart = ({ data, width, height }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        const pack = d3.pack()
            .size([width, height])
            .padding(1.5);

        const root = d3.hierarchy({ children: data })
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        const nodes = pack(root).leaves();

        // Add groups for each node
        const nodeGroup = svg.selectAll('g')
            .data(nodes)
            .enter().append('g')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Draw circles
        nodeGroup.append('circle')
            .attr('r', d => d.r)
            .style('fill', 'lightblue')
            .attr('stroke', 'blue');

        // Add shading for duplicate lines
        nodeGroup.append('path')
            .attr('d', d => {
                const r = d.r;
                const angle = (d.data.duplicate_lines / 100) * 2 * Math.PI;
                const largeArcFlag = angle > Math.PI ? 1 : 0;
                const x = Math.sin(angle) * r;
                const y = -Math.cos(angle) * r;
                return `M0,0 L0,-${r} A${r},${r} 0 ${largeArcFlag},1 ${x},${y} Z`;
            })
            .style('fill', 'yellow');

        // Add shading for bad code with transparency
        nodeGroup.append('path')
            .attr('d', d => {
                const r = d.r;
                const angle = (d.data.bad_code / 100) * 2 * Math.PI;
                const largeArcFlag = angle > Math.PI ? 1 : 0;
                const x = Math.sin(angle) * r;
                const y = -Math.cos(angle) * r;
                return `M0,0 L0,-${r} A${r},${r} 0 ${largeArcFlag},1 ${x},${y} Z`;
            })
            .style('fill', 'rgba(255, 0, 0, 0.5)'); // Red with 50% transparency

        // Draw text labels
        nodeGroup.append('text')
            .attr('dy', '0.3em')
            .attr('text-anchor', 'middle')
            .text(d => d.data.value !== 0 ? d.data.name : "")
            .style('font-size', '10px');

        // Add tooltips for nested circles
        nodeGroup.append('title')
            .text(d => `${d.data.name}\nLines: ${d.data.value}\nDuplicate Lines: ${d.data.duplicate_lines}%\nBad_code: ${d.data.bad_code}%\nSecurity Hotspots: ${d.data.security_hotspots}\nVulnerabilities: ${d.data.vulnerabilities}`);
    }, [data, width, height]);

    return <svg ref={svgRef}></svg>;
};

export default BubbleChart;
