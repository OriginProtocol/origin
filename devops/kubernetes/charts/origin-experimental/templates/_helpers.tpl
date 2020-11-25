{{/*
Expand the name of the chart.
*/}}

{{- define "name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this
(by the DNS naming spec).
*/}}

{{- define "dshopBackendStorage.fullname" -}}
{{- printf "dshop-backend-storage" -}}
{{- end -}}

{{- define "dshopBackendMainnet.fullname" -}}
{{- printf "%s-%s" .Release.Name "dshop-backend-mainnet" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "dshopRedisMainnet.fullname" -}}
{{- printf "%s-%s" .Release.Name "dshop-redis-mainnet" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "dshopBackendRinkeby.fullname" -}}
{{- printf "%s-%s" .Release.Name "dshop-backend-rinkeby" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "dshopRedisRinkeby.fullname" -}}
{{- printf "%s-%s" .Release.Name "dshop-redis-rinkeby" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "dshop-issuer-mainnet.fullname" -}}
{{- printf "%s-%s" .Release.Name "dshop-issuer-mainnet" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "dshop-issuer-rinkeby.fullname" -}}
{{- printf "%s-%s" .Release.Name "dshop-issuer-rinkeby" | trunc 63 | trimSuffix "-" -}}
{{- end -}}
