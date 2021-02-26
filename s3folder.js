const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");

// Define a component for serving a static website on S3
class S3Folder extends pulumi.ComponentResource {

    constructor(bucketName, path, opts) {
        // Register this component with name examples:S3Folder
        super("examples:S3Folder", bucketName, {}, opts);
        console.log(`Path where files would be uploaded: ${path}`);

        // Create a bucket and expose a website index document
        let siteBucket = new aws.s3.Bucket(bucketName, {},
            { parent: this } ); // specify resource parent

        // Create a property for the bucket name that was created
        this.bucketName = siteBucket.bucket,

        // Register that we are done constructing the component
        this.registerOutputs();
    }
}

module.exports.S3Folder = S3Folder;
