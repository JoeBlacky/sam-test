module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      all: {
        options: {
        outputStyle: 'compressed',
        sourceMap: true
        },
        files: {
          'assets/css/app.css': 'assets/scss/app.scss'
        }
      }
    },

    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer-core')({
            browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'ie >6']
          })
        ]
      },
      all: {
        src: 'assets/css/*.css'
      }
    },

    uglify: {
      options: {
        sourceMap: true
      },
      vendor: {
        files: {
          'assets/js/vendor.min.js': [
            'assets/js/vendor/jquery.js',
            'assets/js/vendor/slick.js',
            'assets/js/vendor/nouislider.js',
            'assets/js/vendor/wNumb.js',
          ]
        }
      },
      custom: {
        files: {
          'assets/js/app.min.js': [
            'assets/js/custom/app.js'
          ]
        }
      }
    },

    imagemin: {
      all: {
        files: [{
          expand: true,
          cwd: 'assets/img/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'assets/img/'
        }]
      }
    },

    svgstore: {
      options: {
        cleanupdefs: true
      },
      default: {
        files: {
          'assets/img//defs.svg': ['assets/img//svg/*.svg']
        }
      }
    },

    svginjector: {
      svgdefs: {
        options: {
          container: '#svgPlaceholder'
        },
        files: {
          'assets/js/dev/svgdefs.js': 'assets/img/defs.svg'
        }
      }
    },

    sprite:{
      all: {
        src: 'assets/img/icons/*.png',
        dest: 'assets/img/icons.png',
        destCss: 'assets/css/sprites.css',
        padding: 5
      }
    },

    watch: {
      sass: {
        files: 'assets/scss/**/*.scss',
        tasks: ['sass', 'postcss']
      },
      jsVendor: {
        files: 'js/vendor/**/*.js',
        tasks: ['uglify:vendor']
      },
      jsCustom: {
        files: 'js/custom/**/*.js',
        tasks: ['uglify:custom']
      },
      svg: {
        files: 'assets/img/svg/*.svg',
        tasks: ['svgstore', 'svginjector']
      }
    }

  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  //grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-svgstore');
  grunt.loadNpmTasks('grunt-svginjector');
  grunt.loadNpmTasks('grunt-spritesmith');

  grunt.registerTask('default', ['sass', 'postcss', 'imagemin', 'svgstore', 'svginjector', 'uglify']);

};
