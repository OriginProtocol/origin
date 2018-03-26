import json

EARTH_SRID = 4326

def point_str(lat, lng):
	return 'SRID=%d;POINT(%s %s)' % (EARTH_SRID, lng, lat)

def get_or_create(session, model, **kwargs):
	instance = session.query(model).filter_by(**kwargs).first()
	if instance:
		return instance
	else:
		instance = model(**kwargs)
		session.add(instance)
		session.commit()
		return instance

# makes a geojson file from non-standard lat/lng
# full_geojson = True gives us a working geojson file
# full_geojson = False gives us a the geo part that we need to pass to postgis
def geojson_str(polygons, full_geojson = False):
	if polygons:
		boundary = []
		for polygon in polygons:
			ps = []
			for coordinates in polygon:
				ps.append([float(coordinates['lng']), float(coordinates['lat'])])
			boundary.append(ps)

		geo = {}
		geo['type'] = "MultiPolygon"
		geo['coordinates'] = [boundary]

		full = {}
		full['type'] = "Feature"
		full['properties'] = {}
		full['geometry'] = geo

		if full_geojson:
			return json.dumps(full)
		else:
			return json.dumps(geo)	
	else:
		return None