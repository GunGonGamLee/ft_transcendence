FROM elasticsearch:7.17.16

RUN elasticsearch-plugin install analysis-icu

RUN mkdir -p /usr/share/elasticsearch/config/certs

COPY ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml