module Jekyll

  class RandomNumberGenerator < Generator

    def generate(site)
      site.config['random_number'] = Random.new.rand(1000000)
    end

  end

end
