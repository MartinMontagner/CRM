IMAGE_DIR=$1
TAG=$2

ECR_REGISTRY_URL=484907513804.dkr.ecr.eu-south-2.amazonaws.com

if [ -z "$1" ]
then
    echo "The parameter <image-directory> is missing."
    echo "Usage: ./update-image.sh <image-directory>"
    echo "Example: ./update-image.sh cocreadores-task-image"
    exit 1
fi

IMAGE_DIR=${IMAGE_DIR%%/}
CURRENT_DIR=$(pwd)
if ! [ -d "$IMAGE_DIR" ]
then
    echo "The parameter <image-directory> is invalid. $IMAGE_DIR is not a valid subdirectory of the current folder"
    echo "Usage: ./update-image.sh <image-directory>"
    echo "Example: ./update-image.sh cocreadores-task-image"
    exit 1
fi

cd "$IMAGE_DIR" || exit 1

if [ -z "$TAG" ]
then
    TAG=$(date +'%Y-%m-%d-%H-%M')-$(git rev-parse --short HEAD)
    echo "Using generated tag: $TAG"
else
    echo "Using provided tag: $TAG"
fi

IMAGE_NAME=$IMAGE_DIR
echo "Updating image: $IMAGE_NAME"
docker login --username AWS --password "$(aws ecr get-login-password --region eu-south-2)" "$ECR_REGISTRY_URL"
docker build --platform linux/amd64 --network=host --no-cache -f Dockerfile -t "$IMAGE_NAME:$TAG" .
docker tag "$IMAGE_NAME:$TAG" "$ECR_REGISTRY_URL/$IMAGE_NAME:$TAG"
docker push "$ECR_REGISTRY_URL/$IMAGE_NAME:$TAG"

cd "$CURRENT_DIR" || exit 1