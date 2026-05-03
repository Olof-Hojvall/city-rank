import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore } from '@/state/store';
import { GRADE_COLORS, GRADES, type Grade } from '@/lib/grades';
import { topNCitiesInBounds } from '@/lib/viewport';
import type { City } from '@/data/cities';

export type MapHandle = {
  flyTo: (city: City) => void;
};

type Props = {
  cities: City[];
  hideUnrated?: boolean;
};

const TOP_N = 300;

function citiesToGeoJSON(cities: City[]) {
  return {
    type: 'FeatureCollection' as const,
    features: cities.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { id: c.id, name: c.name, country: c.country, pop: c.pop },
    })),
  };
}

function rankedToGeoJSON(cities: City[], rankings: Record<number, Grade>) {
  const cityMap = new Map(cities.map((c) => [c.id, c]));
  const features = Object.entries(rankings)
    .map(([idStr, grade]) => {
      const c = cityMap.get(Number(idStr));
      if (!c) return null;
      return {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
        properties: { id: c.id, name: c.name, country: c.country, pop: c.pop, grade },
      };
    })
    .filter(
      (f): f is NonNullable<typeof f> => f !== null,
    );
  return { type: 'FeatureCollection' as const, features };
}

export const CityMap = forwardRef<MapHandle, Props>(function Map({ cities, hideUnrated = false }, ref) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { rankings, setSelectedCity, setViewportCities } = useStore();
  const rankingsRef = useRef(rankings);
  rankingsRef.current = rankings;

  useImperativeHandle(ref, () => ({
    flyTo(city: City) {
      mapRef.current?.flyTo({ center: [city.lng, city.lat], zoom: 8, duration: 1200 });
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
            maxzoom: 19,
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [10, 30],
      zoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('cities-top-src', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addSource('cities-ranked-src', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'cities-top',
        type: 'circle',
        source: 'cities-top-src',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3, 8, 6, 12, 10],
          'circle-color': '#94a3b8',
          'circle-opacity': 0.7,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#475569',
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gradeColorExpr: any = [
        'match',
        ['get', 'grade'],
        ...GRADES.flatMap((g) => [g, GRADE_COLORS[g]]),
        '#94a3b8',
      ];

      map.addLayer({
        id: 'cities-ranked',
        type: 'circle',
        source: 'cities-ranked-src',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 6, 8, 10, 12, 14],
          'circle-color': gradeColorExpr,
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      const updateViewport = () => {
        const b = map.getBounds();
        const bounds = { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() };
        const topCities = topNCitiesInBounds(cities, bounds, TOP_N);
        setViewportCities(topCities);
        (map.getSource('cities-top-src') as maplibregl.GeoJSONSource).setData(
          citiesToGeoJSON(topCities),
        );
        (map.getSource('cities-ranked-src') as maplibregl.GeoJSONSource).setData(
          rankedToGeoJSON(cities, rankingsRef.current),
        );
      };

      map.on('moveend', updateViewport);
      updateViewport();

      map.on('click', 'cities-top', (e) => {
        const f = e.features?.[0];
        if (f) setSelectedCity(f.properties.id as number);
      });
      map.on('click', 'cities-ranked', (e) => {
        const f = e.features?.[0];
        if (f) setSelectedCity(f.properties.id as number);
      });
      map.on('mouseenter', 'cities-top', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'cities-top', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'cities-ranked', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'cities-ranked', () => { map.getCanvas().style.cursor = ''; });
    });

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, [cities]);

  // Update ranked layer whenever rankings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('cities-ranked-src') as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData(rankedToGeoJSON(cities, rankings));
  }, [rankings, cities]);

  // Toggle unrated dot visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setLayoutProperty('cities-top', 'visibility', hideUnrated ? 'none' : 'visible');
  }, [hideUnrated]);

  return <div ref={containerRef} className="h-full w-full" />;
});
