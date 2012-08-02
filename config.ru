use Rack::Static,
    :urls => ["/js", "/lib", "/res/fnt", "/res/img" ],
    :root => "pub"

run lambda { |env|

    [
        200, 
        {
            'Content-Type'  => 'text/html', 
            'Cache-Control' => 'pub, max-age=86400' 
        },
        File.open( 'pub/index.html', File::RDONLY )
    ]

}