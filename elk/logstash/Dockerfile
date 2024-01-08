FROM logstash:7.17.16

RUN logstash-plugin install logstash-filter-json
RUN logstash-plugin install logstash-output-elasticsearch

COPY conf/logstash.yml /usr/share/logstash/config/logstash.yml
COPY pipeline/logstash.conf /usr/share/logstash/pipeline/logstash.conf