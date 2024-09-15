import { getJobs } from '@/api/apiJobs'
import useFetch from '@/hooks/use-fetch'
import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { BarLoader} from 'react-spinners'
import { useState } from 'react'
import JobCard from '@/components/job-card'
import { getCompanies } from '@/api/apiCompanies'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import * as React from "react"
 
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { City, State } from 'country-state-city'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
 

const JobListing = () => {

  const [cities, setCities] = useState([]);

  const [currentPage, setCurrentPage] = useState(1)

  const [itemsPerPage] = useState(12)

 

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [company_id, setCompany_id] = useState("");

 const  { isLoaded } = useUser()

 const  {fn: fnJobs, data: jobs, loading: loadingJobs,} = useFetch(getJobs, {
  location,
  company_id,
  searchQuery
 })

 const  {fn: fnCompanies, data: companies} = useFetch(getCompanies)

 const indexOfLastJob = currentPage * itemsPerPage
 const indexOfFirstJob = indexOfLastJob - itemsPerPage
 const currentJobs = jobs?.slice(indexOfFirstJob, indexOfLastJob)

 useEffect(() => {
  if(isLoaded) {
    fnCompanies()
  }

}, [isLoaded])


 useEffect(() => {
    if(isLoaded) {
      fnJobs()
    }
 
 }, [isLoaded, location, company_id, searchQuery])

 useEffect(() => {
  // Fetch cities directly if supported
  const fetchedCities = City.getCitiesOfCountry("NO"); // Replace with correct method if different
  setCities(fetchedCities);
}, []);

 if(!isLoaded){
  return <BarLoader className='mb-4' width={"100%"} color='#36d7b7'/>
}

const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
}

const totalPages = jobs ? Math.ceil(jobs.length / itemsPerPage) : 0

const handleSearch= (e) => {
  e.preventDefault()

  let formData = new FormData(e.target)

  const query = formData.get("search-query")
  if(query) setSearchQuery(query)
}

const clearFilters = () => {
  setSearchQuery("");
  setCompany_id("");
  setLocation("");
};
  return (
    <div className='min-h-screen flex flex-col'>
      <h1 className='gradient-title font-extrabold text-6xl sm:text-7xl text-center pb-8'>Latest jobs</h1>

      {/* Add filters here */}
      <form onSubmit={handleSearch} className='h-14 flex w-full gap-2 items-center mb-3'>
        <Input type="text" placeholder="Search jobs by title.." name="search-query"
        className="h-full flex-1 px-4 text-md"
        />
        <Button type="submit" className="h-full sm:w-28" variant="blue">
          Search
        </Button>
      </form>

      <div className='flex flex-col sm:flex-row gap-2'>
      <Select value={location} onValueChange={(value) => setLocation(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Filter by location" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {cities.map(({name}) => {
            return (
            <SelectItem key={name} value={name}  >{name}</SelectItem>
            )
          })}
          
        </SelectGroup>
      </SelectContent>
    </Select>
    
    <Select value={company_id} onValueChange={(value) => setCompany_id(value)}>
      <SelectTrigger >
        <SelectValue placeholder="Filter by Company" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {companies?.map(({name, id}) => {
            return (
            <SelectItem key={name} value={id}  >{name}</SelectItem>
            )
          })}
          
      
        </SelectGroup>
      </SelectContent>
    </Select>
    <Button className="sm:w-1/2"
          variant="destructive"
          onClick={clearFilters} > Clear Filters</Button>
      </div>

      {loadingJobs && (
        <BarLoader className='mt-4' width={"100%"} color='#36d7b7'/>
      )}
      {loadingJobs === false && (
        <div className='mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {currentJobs?.length ? (
            currentJobs.map((job) => {
              return <JobCard key={job.id} job={job}
              savedInit={job.saved?.length>0}
              />
            })
          ) : (
            <p>No jobs found</p>
          )}
        </div>
      
       
      )}
      
      <div className='mt-auto'>
      
       <Pagination >
        <PaginationContent >
          <PaginationItem >
            <PaginationPrevious 
            onClick={() => handlePageChange(Math.max(currentPage -1, 1))}
            disabled={currentPage === 1}
            className="cursor-pointer"            
            />            
          </PaginationItem>
          {Array.from({length: totalPages}, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink onClick={() => handlePageChange(index +1)}
                className={currentPage === index +1 ? 'active' : ''}
                >
                  {index +1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {totalPages > 5 && (
            <PaginationItem>
              <PaginationEllipsis/>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
            onClick={() => handlePageChange(Math.min(currentPage +1, totalPages))}
            disabled={currentPage === totalPages}
            className="cursor-pointer"
            />
          </PaginationItem>
        </PaginationContent>
       </Pagination>

       
       </div>

    </div>
  )
}

export default JobListing