"use strict";

const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");
const mime = require("mime");
const s3folder = require("./s3folder.js");

// Create an instance of the S3Folder component
let folder = new s3folder.S3Folder("s3-website-bucket", "./public");

// Export output property of `folder` as a stack output
exports.bucketName = folder.bucketName;

// Create a bucket and expose a website index document
let siteBucket = new aws.s3.Bucket("s3-website-bucket", {
    website: {
        indexDocument: "index.html",
    },
});

let siteDir = "www/public"; // directory for content files

// For each file in the directory, create an S3 object stored in `siteBucket`
for (let item of require("fs").readdirSync(siteDir)) {
    let filePath = require("path").join(siteDir, item);
    let object = new aws.s3.BucketObject(item, {
        bucket: siteBucket,                               // reference the s3.Bucket object
        source: new pulumi.asset.FileAsset(filePath),     // use FileAsset to point to a file
        contentType: mime.getType(filePath) || undefined, // set the MIME type of the file
    });
}

// Create an S3 Bucket Policy to allow public read of all objects in bucket
function publicReadPolicyForBucket(bucketName) {
    return {
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: "*",
            Action: [
                "s3:GetObject"
            ],
            Resource: [
                `arn:aws:s3:::${bucketName}/*` // policy refers to bucket name explicitly
            ]
        }]
    };
}
// Set the access policy for the bucket so all objects are readable
let bucketPolicy = new aws.s3.BucketPolicy("bucketPolicy", {
    bucket: siteBucket.bucket, // refer to the bucket created earlier
    policy: siteBucket.bucket.apply(publicReadPolicyForBucket) // use output property `siteBucket.bucket`
});

using Pulumi;
using Aws = Pulumi.Aws;

class MyStack : Stack
{
    public MyStack()
    {
        var bucket = new Aws.S3.Bucket("bucket", new Aws.S3.BucketArgs
        {
            Acl = "private",
            Tags = 
            {
                { "Name", "My bucket" },
            },
        });
        var s3OriginId = "myS3Origin";
        var s3Distribution = new Aws.CloudFront.Distribution("s3Distribution", new Aws.CloudFront.DistributionArgs
        {
            Origins = 
            {
                new Aws.CloudFront.Inputs.DistributionOriginArgs
                {
                    DomainName = bucket.BucketRegionalDomainName,
                    OriginId = s3OriginId,
                    S3OriginConfig = new Aws.CloudFront.Inputs.DistributionOriginS3OriginConfigArgs
                    {
                        OriginAccessIdentity = "origin-access-identity/cloudfront/ABCDEFG1234567",
                    },
                },
            },
            Enabled = true,
            IsIpv6Enabled = true,
            Comment = "Some comment",
            DefaultRootObject = "index.html",
            LoggingConfig = new Aws.CloudFront.Inputs.DistributionLoggingConfigArgs
            {
                IncludeCookies = false,
                Bucket = "mylogs.s3.amazonaws.com",
                Prefix = "myprefix",
            },
            Aliases = 
            {
                "mysite.example.com",
                "yoursite.example.com",
            },
            DefaultCacheBehavior = new Aws.CloudFront.Inputs.DistributionDefaultCacheBehaviorArgs
            {
                AllowedMethods = 
                {
                    "DELETE",
                    "GET",
                    "HEAD",
                    "OPTIONS",
                    "PATCH",
                    "POST",
                    "PUT",
                },
                CachedMethods = 
                {
                    "GET",
                    "HEAD",
                },
                TargetOriginId = s3OriginId,
                ForwardedValues = new Aws.CloudFront.Inputs.DistributionDefaultCacheBehaviorForwardedValuesArgs
                {
                    QueryString = false,
                    Cookies = new Aws.CloudFront.Inputs.DistributionDefaultCacheBehaviorForwardedValuesCookiesArgs
                    {
                        Forward = "none",
                    },
                },
                ViewerProtocolPolicy = "allow-all",
                MinTtl = 0,
                DefaultTtl = 3600,
                MaxTtl = 86400,
            },
            OrderedCacheBehaviors = 
            {
                new Aws.CloudFront.Inputs.DistributionOrderedCacheBehaviorArgs
                {
                    PathPattern = "/content/immutable/*",
                    AllowedMethods = 
                    {
                        "GET",
                        "HEAD",
                        "OPTIONS",
                    },
                    CachedMethods = 
                    {
                        "GET",
                        "HEAD",
                        "OPTIONS",
                    },
                    TargetOriginId = s3OriginId,
                    ForwardedValues = new Aws.CloudFront.Inputs.DistributionOrderedCacheBehaviorForwardedValuesArgs
                    {
                        QueryString = false,
                        Headers = 
                        {
                            "Origin",
                        },
                        Cookies = new Aws.CloudFront.Inputs.DistributionOrderedCacheBehaviorForwardedValuesCookiesArgs
                        {
                            Forward = "none",
                        },
                    },
                    MinTtl = 0,
                    DefaultTtl = 86400,
                    MaxTtl = 31536000,
                    Compress = true,
                    ViewerProtocolPolicy = "redirect-to-https",
                },
                new Aws.CloudFront.Inputs.DistributionOrderedCacheBehaviorArgs
                {
                    PathPattern = "/content/*",
                    AllowedMethods = 
                    {
                        "GET",
                        "HEAD",
                        "OPTIONS",
                    },
                    CachedMethods = 
                    {
                        "GET",
                        "HEAD",
                    },
                    TargetOriginId = s3OriginId,
                    ForwardedValues = new Aws.CloudFront.Inputs.DistributionOrderedCacheBehaviorForwardedValuesArgs
                    {
                        QueryString = false,
                        Cookies = new Aws.CloudFront.Inputs.DistributionOrderedCacheBehaviorForwardedValuesCookiesArgs
                        {
                            Forward = "none",
                        },
                    },
                    MinTtl = 0,
                    DefaultTtl = 3600,
                    MaxTtl = 86400,
                    Compress = true,
                    ViewerProtocolPolicy = "redirect-to-https",
                },
            },
            PriceClass = "PriceClass_200",
            Restrictions = new Aws.CloudFront.Inputs.DistributionRestrictionsArgs
            {
                GeoRestriction = new Aws.CloudFront.Inputs.DistributionRestrictionsGeoRestrictionArgs
                {
                    RestrictionType = "whitelist",
                    Locations = 
                    {
                        "US",
                        "CA",
                        "GB",
                        "DE",
                    },
                },
            },
            Tags = 
            {
                { "Environment", "production" },
            },
            ViewerCertificate = new Aws.CloudFront.Inputs.DistributionViewerCertificateArgs
            {
                CloudfrontDefaultCertificate = true,
            },
        });
    }

}

// Stack exports
exports.bucketName = siteBucket.bucket;
exports.websiteUrl = siteBucket.websiteEndpoint;


