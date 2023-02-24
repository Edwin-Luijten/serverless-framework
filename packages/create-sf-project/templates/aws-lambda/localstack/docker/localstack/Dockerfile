FROM localstack/localstack

# localstack init script
COPY init-aws.sh /etc/localstack/init/ready.d/init-aws.sh
RUN chmod +x /etc/localstack/init/ready.d/init-aws.sh

# unistall aws cli v1
RUN pip3 uninstall awscli -y

# install aws cli v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install